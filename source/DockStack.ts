/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, html, property, PropertyValues } from "./CustomElement";
import { DockContentRegistry } from "./DockView";
import DockStrip from "./DockStrip";
import DockPanel, { DropZone, IDockPanelLayout } from "./DockPanel";
import DockPanelHeader from "./DockPanelHeader";
import DockView from "./DockView";

////////////////////////////////////////////////////////////////////////////////

export interface IDockStackLayout
{
    type: "stack";
    size: number;
    activePanelIndex: number;
    panels: IDockPanelLayout[];
}

@customElement
export default class DockStack extends CustomElement
{
    static readonly tagName: string = "ff-dock-stack";

    @property({ type: Number })
    activeIndex: number = 0;

    protected layoutApplied = false;

    protected headers: HTMLElement;
    protected activeHeader: DockPanelHeader = null;

    protected dropMarker: HTMLElement = null;
    protected dropTarget: DockPanel = null;
    protected dropZone: DropZone = "none";


    constructor()
    {
        super();

        this.onDragOver = this.onDragOver.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);

        this.addEventListener("dragover", this.onDragOver);
        this.addEventListener("dragleave", this.onDragLeave);
        this.addEventListener("drop", this.onDrop);

        this.style.position = "relative";
        this.style.flex = "1 1";
        this.style.display = "flex";
        this.style.flexDirection = "column";
        this.style.overflow = "hidden";

        const size = Number(this.getAttribute("size"));
        this.style.flexBasis = ((size || 1) * 100).toFixed(3) + "%";

        this.headers = document.createElement("header");
        const headersStyle = this.headers.style;
        headersStyle.flex = "1 0 auto";
        headersStyle.flexWrap = "wrap";
        headersStyle.display = "flex";
        headersStyle.flexDirection = "row";
        headersStyle.overflow = "hidden";

        this.appendChild(this.headers);
    }

    activatePanel(panel: DockPanel)
    {
        if (this.activeHeader && this.activeHeader.panel === panel) {
            return;
        }

        if (this.activeHeader) {
            this.activeHeader.active = false;
        }

        this.activeHeader = panel.header;
        this.activeHeader.active = true;
    }

    insertPanel(panel: DockPanel, beforePanel?: DockPanel)
    {
        this.layoutApplied = true;
        this.appendChild(panel);

        const header = new DockPanelHeader(panel);

        if (beforePanel) {
            this.headers.insertBefore(header, beforePanel.header);
        }
        else {
            this.headers.appendChild(header);
        }
    }

    removePanel(panel: DockPanel)
    {
        const header = panel.header;
        this.headers.removeChild(header);
        this.removeChild(panel);

        if (this.getPanelCount() === 0) {
            const strip = this.parentElement as DockStrip;
            strip.removeDockElement(this);
        }
        else if (this.activeHeader === header) {
            const firstHeader = this.headers.firstChild as DockPanelHeader;
            this.activatePanel(firstHeader.panel);
        }
    }

    getPanelCount()
    {
        return this.headers.childElementCount;
    }

    setLayout(layout: IDockStackLayout, registry: DockContentRegistry)
    {
        this.layoutApplied = true;

        this.style.flexBasis = (layout.size * 100).toFixed(3) + "%";
        layout.panels.forEach(layout => {
            const panel = new DockPanel();
            panel.setLayout(layout, registry);
            this.insertPanel(panel);
        });

        const firstHeader = this.headers.firstElementChild as DockPanelHeader;
        if (firstHeader) {
            this.activatePanel(firstHeader.panel);
        }
    }

    getLayout(): IDockStackLayout
    {
        const panels = Array.from(this.getElementsByTagName("ff-dock-panel")) as DockPanel[];
        const panelLayouts = panels.map(panel => panel.getLayout());
        let activePanelIndex = -1;

        for (let i = 0, n = panels.length; i < n; ++i) {
            if (panels[i] === this.activeHeader.panel) {
                activePanelIndex = i;
                break;
            }
        }

        return {
            type: "stack",
            size: parseFloat(this.style.flexBasis) * 0.01,
            activePanelIndex,
            panels: panelLayouts
        };
    }

    onDragOver(event: DragEvent)
    {
        const items = Array.from(event.dataTransfer.items);
        if (items.find(item => item.type === DockPanel.dragDropMimeType)) {
            this.updateDropMarker(event);
            event.stopPropagation();
            event.preventDefault();
        }
    }

    onDragLeave(event: DragEvent)
    {
        this.updateDropMarker();
        event.stopPropagation();
    }

    onDrop(event: DragEvent)
    {
        event.stopPropagation();
        this.updateDropMarker();

        const panelId = event.dataTransfer.getData(DockPanel.dragDropMimeType);

        if (this.dropTarget && this.dropZone !== "none") {
            this.dropTarget.movePanel(panelId, this.dropZone);
        }

        this.dispatchEvent(new CustomEvent(DockView.changeEvent, { bubbles: true }));
    }

    protected updateDropMarker(event?: DragEvent)
    {
        let marker = this.getElementsByClassName("ff-dock-drop-marker").item(0) as HTMLDivElement;

        if (!event) {
            if (marker) {
                this.removeChild(marker);
            }
            return;
        }

        if (!marker) {
            marker = document.createElement("div");
            marker.classList.add("ff-dock-drop-marker");
            this.appendChild(marker);
            this.dropTarget = null;
            this.dropZone = "none";
        }

        const style = marker.style;
        style.pointerEvents = "none";
        style.width = "25px";
        style.position = "absolute";
        style.zIndex = "1";

        let dropTarget = this.dropTarget;
        let dropZone = this.dropZone;
        let headerRect;

        if (event.currentTarget === this) {
            const lastHeader = this.headers.lastChild as DockPanelHeader;
            headerRect = lastHeader.getBoundingClientRect();
            dropTarget = lastHeader.panel;
            dropZone = "after";
        }
        else if (event.currentTarget instanceof DockPanelHeader) {
            headerRect = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - headerRect.left) / headerRect.width;
            dropTarget = event.currentTarget.panel;
            dropZone = x < 0.5 ? "before" : "after";
        }
        else {
            dropTarget = null;
            dropZone = "none";
        }

        if (dropTarget !== this.dropTarget || dropZone !== this.dropZone) {
            this.dropTarget = dropTarget;
            this.dropZone = dropZone;
            if (dropTarget) {
                const parentRect = this.headers.getBoundingClientRect();
                const stackRect = this.getBoundingClientRect();
                const pos = dropZone === "before" ? headerRect.left : headerRect.right;
                style.top = (parentRect.top - stackRect.top) + "px";
                style.height = parentRect.height + "px";
                style.left = (pos - stackRect.left) + "px";
            }
            else {
                marker.remove();
            }
        }
    }

    protected createRenderRoot()
    {
        return this;
    }

    protected update(changedProperties: PropertyValues)
    {
        super.update(changedProperties);

        if (!this.layoutApplied) {
            this.parseChildren();
        }
    }

    protected parseChildren()
    {
        Array.from(this.children).forEach(child => {
            if (child !== this.headers) {
                this.removeChild(child);

                if (child instanceof DockPanel) {
                    this.insertPanel(child);
                }
                else {
                    const panel = new DockPanel();
                    panel.appendChild(child);
                    this.insertPanel(panel);
                }
            }
        });

        const firstHeader = this.headers.firstElementChild as DockPanelHeader;
        if (firstHeader) {
            this.activatePanel(firstHeader.panel);
        }
    }
}
