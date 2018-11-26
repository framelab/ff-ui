/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { LitElement, html, property, PropertyValues } from "@polymer/lit-element";

import DockPanel from "./DockPanel";
import DockStack from "./DockStack";

////////////////////////////////////////////////////////////////////////////////

export interface IDockPanelCloseEvent extends CustomEvent {
    detail: {
        panelId: string;
    }
}

export default class DockPanelHeader extends LitElement
{
    static readonly tagName: string = "ff-dock-panel-header";

    @property({ type: Boolean, reflect: true })
    active = false;

    readonly panel: DockPanel;

    constructor(panel: DockPanel)
    {
        super();

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);

        this.addEventListener("click", this.onClick);
        this.addEventListener("dragstart", this.onDragStart);
        this.addEventListener("dragover", this.onDragOver);
        this.addEventListener("dragleave", this.onDragLeave);
        this.addEventListener("drop", this.onDrop);

        this.panel = panel;
        panel.header = this;

        const style = this.style;
        style.flex = "0 0 auto";
        style.display = "block";
        style.userSelect = "none";
        style.cursor = "pointer";
    }

    protected createRenderRoot()
    {
        return this;
    }

    protected update(changedProperties: PropertyValues)
    {
        super.update(changedProperties);

        if (this.panel.movable) {
            this.setAttribute("draggable", "true");
        }
        else {
            this.removeAttribute("draggable");
        }


        if (changedProperties.has("active")) {
            this.panel.active = this.active;
        }
    }

    protected render()
    {
        const {
            text,
            closable,
            movable
        } = this.panel;

        let icon = closable
            ? html`<button class="ff-button ff-icon fas fa-times" @click=${this.onClickButton}></button>`
            : (movable ? html`<label class="ff-icon fas fa-th"></label>` : null);

        return html`
            <label class="ff-text">${text}</label>
            ${icon}
        `;
    }

    protected onClick(event: MouseEvent)
    {
        this.panel.activatePanel();

        this.dispatchEvent(new CustomEvent("change", { bubbles: true }));
    }

    protected onClickButton(event: MouseEvent)
    {
        this.dispatchEvent(new CustomEvent("close", {
            detail: {
                panelId: this.panel.id
            }
        } as IDockPanelCloseEvent));

        this.panel.closePanel();
        event.stopPropagation();

        this.dispatchEvent(new CustomEvent("change", { bubbles: true }));
    }

    protected onDragStart(event: DragEvent)
    {
        // activate panel
        const stack = this.panel.parentElement as DockStack;
        stack.activatePanel(this.panel);

        event.dataTransfer.setData(DockPanel.dragDropMimeType, this.panel.id);
        event.dataTransfer.dropEffect = "move";
    }

    protected onDragOver(event: DragEvent)
    {
        const items = Array.from(event.dataTransfer.items);
        if (items.find(item => item.type === DockPanel.dragDropMimeType)) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    protected onDragLeave(event: DragEvent)
    {
    }

    protected onDrop(event: DragEvent)
    {
        event.stopPropagation();

        const rect = this.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const zone = x < 0.5 ? "before" : "after";

        const panelId = event.dataTransfer.getData(DockPanel.dragDropMimeType);
        this.panel.movePanel(panelId, zone);

        this.dispatchEvent(new CustomEvent("change", { bubbles: true }));
    }
}

customElements.define(DockPanelHeader.tagName, DockPanelHeader);