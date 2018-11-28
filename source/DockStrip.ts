/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property, PropertyValues } from "./CustomElement";

import Splitter, { ISplitterChangeEvent, SplitterDirection } from "./Splitter";
import { DockContentRegistry } from "./DockView";
import DockStack, { IDockStackLayout } from "./DockStack";
import DockPanel, { DropZone } from "./DockPanel";
import DockView from "./DockView";

////////////////////////////////////////////////////////////////////////////////

export interface IDockStripLayout
{
    type: "strip";
    size: number;
    direction: SplitterDirection;
    elements: IDockElementLayout[];
}

export type DockElement = DockStrip | DockStack;
export type IDockElementLayout = IDockStripLayout | IDockStackLayout;

const _isDockElement = e => e instanceof DockStrip || e instanceof DockStack;

@customElement
export default class DockStrip extends CustomElement
{
    static readonly tagName: string = "ff-dock-strip";

    @property({ type: String })
    direction: SplitterDirection = "horizontal";

    protected layoutApplied = false;

    constructor()
    {
        super();

        this.style.flex = "1 1";
        this.style.display = "flex";
        this.style.alignItems = "stretch";
        this.style.overflow = "hidden";

        const size = Number(this.getAttribute("size"));
        this.style.flexBasis = ((size || 1) * 100).toFixed(3) + "%";
    }

    insertDockElement(element: DockElement, before?: DockElement)
    {
        this.layoutApplied = true;
        this.insertBefore(element, before);
        this.updateSplitters();
    }

    insertPanel(panel: DockPanel, stack: DockStack, zone: DropZone)
    {
        const zoneDirection = (zone === "left" || zone === "right") ? "horizontal" : "vertical";
        const zoneBefore = zone === "left" || zone === "top";

        // wrap panel in new stack
        const newStack = new DockStack();
        newStack.insertPanel(panel);
        newStack.activatePanel(panel);

        // if there is less than two elements in this strip, we can adapt direction
        const elements = this.getDockElements();
        if (elements.length < 2) {
            this.direction = zoneDirection;
        }

        let insertBefore: DockElement = stack;
        if (!zoneBefore) {
            for (let i = 0, n = elements.length; i < n; ++i) {
                if (elements[i] === stack) {
                    insertBefore = elements[i + 1] as DockElement;
                    break;
                }
            }
        }

        if (zoneDirection === this.direction) {
            // direction matches, insert new stack into strip
            const size = (parseFloat(stack.style.flexBasis) * 0.5).toFixed(3) + "%";
            stack.style.flexBasis = newStack.style.flexBasis = size;
            this.insertDockElement(newStack, insertBefore);
        }
        else {
            // create new strip in orthogonal direction, insert stack into new strip
            const newStrip = new DockStrip();
            newStrip.direction = zoneDirection;
            newStrip.style.flexBasis = stack.style.flexBasis;
            stack.style.flexBasis = newStack.style.flexBasis = "50%";
            this.insertBefore(newStrip, stack);
            newStrip.appendChild(stack);
            newStrip.insertDockElement(newStack, zoneBefore ? stack : null);
        }
    }

    removeDockElement(element: DockElement)
    {
        let children = this.getDockElements();

        if (children.length === 1) {
            return;
        }

        // remove the element and get remaining elements
        this.removeChild(element);

        // if only one element remains and parent is also a dock strip, merge with parent
        children = this.getDockElements();
        if (children.length < 2 && this.parentElement instanceof DockStrip) {
            const parentStrip = this.parentElement;
            const remainingElement = children[0] as DockElement;
            this.removeChild(remainingElement);

            remainingElement.style.flexBasis = this.style.flexBasis;
            parentStrip.insertBefore(remainingElement, this);
            parentStrip.removeChild(this);
            parentStrip.updateSplitters();
        }
        else {
            this.updateSplitters();
        }
    }

    getDockElements()
    {
        return Array.from(this.children).filter(_isDockElement);
    }

    setLayout(layout: IDockStripLayout, registry: DockContentRegistry)
    {
        this.layoutApplied = true;

        this.style.flexBasis = (layout.size * 100).toFixed(3) + "%";
        this.direction = layout.direction;

        layout.elements.forEach((elementLayout, index) => {
            let element;

            switch(elementLayout.type) {
                case "strip":
                    element = new DockStrip();
                    break;
                case "stack":
                    element = new DockStack();
                    break;
            }

            element.setLayout(elementLayout, registry);
            this.appendChild(element);
        });

        this.updateSplitters();
    }

    getLayout(): IDockStripLayout
    {
        const elements: any = Array.from(this.children)
            .filter(_isDockElement)
            .map((element: DockElement) => element.getLayout());

        return {
            type: "strip",
            size: parseFloat(this.style.flexBasis) * 0.01,
            direction: this.direction,
            elements
        };
    }

    isHorizontal()
    {
        return this.direction === "horizontal";
    }

    protected onSplitterChange(event: ISplitterChangeEvent)
    {
        if (!event.detail.isDragging) {
            this.dispatchEvent(new CustomEvent(DockView.changeEvent, { bubbles: true }));
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

        if (changedProperties.has("direction")) {
            this.style.flexDirection = this.isHorizontal() ? "row" : "column";
            this.updateSplitters();
        }
    }

    protected updateSplitters()
    {
        const children = Array.from(this.children);
        const parent = this.parentElement;

        if (!parent) {
            return;
        }

        const isHorizontal = this.isHorizontal();

        const dockElements = [];
        const elementSizes = [];
        let childrenSize = 0;

        for (let i = 0, n = children.length; i < n; ++i) {
            const child = children[i];
            const nextChild = child.nextElementSibling;

            // remove redundant splitter handles
            if (child instanceof Splitter && (i === 0 || !nextChild || nextChild instanceof Splitter)) {
                this.removeChild(child);
                continue;
            }

            if (!_isDockElement(child)) {
                continue;
            }

            // sum size of children
            const childRect = child.getBoundingClientRect();
            const childSize = isHorizontal ? childRect.width : childRect.height;
            childrenSize += childSize;
            dockElements.push(child);
            elementSizes.push(childSize);

            // add splitter between previous and this child if necessary
            const prevChild = child.previousElementSibling;
            if (prevChild && !(prevChild instanceof Splitter)) {
                const splitter = new Splitter();
                splitter.direction = this.direction;
                splitter.addEventListener(Splitter.changeEvent, this.onSplitterChange);
                this.insertBefore(splitter, child);
            }
        }

        // adjust sizes
        for (let i = 0, n = dockElements.length; i < n; ++i) {
            dockElements[i].style.flexBasis = (elementSizes[i] / childrenSize * 100).toFixed(3) + "%";
        }
    }

    protected parseChildren()
    {
        Array.from(this.children).forEach(child => {
            if (!_isDockElement(child)) {
                const stack = new DockStack();
                this.insertBefore(stack, child);
                stack.appendChild(child);
            }
        });
    }
}