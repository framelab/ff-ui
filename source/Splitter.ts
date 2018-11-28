/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export interface ISplitterChangeEvent extends CustomEvent
{
    detail: {
        direction: SplitterDirection;
        position: number;
        isDragging: boolean;
    }
}

export type SplitterDirection = "horizontal" | "vertical";

@customElement
export default class Splitter extends CustomElement
{
    static readonly tagName: string = "ff-splitter";
    static readonly changeEvent: string = "ff-splitter-change";

    @property({ type: String })
    direction: SplitterDirection = "horizontal";

    @property({ type: Number })
    width = 5;

    @property({ type: Number })
    margin = 20;

    @property({ type: Boolean })
    detached = false;

    protected isActive = false;
    protected offset = 0;
    protected position = 0;

    constructor()
    {
        super();
        this.setAttribute("touch-action", "none");

        const style = this.style;
        style.position = "relative";
        style.display = "block";
        style.zIndex = "1";
        style.touchAction = "none";

        this.addEventListener("pointerdown", (e) => this.onPointerDown(e));
        this.addEventListener("pointermove", (e) => this.onPointerMove(e));
        this.addEventListener("pointerup", (e) => this.onPointerUp(e));
    }

    isHorizontal()
    {
        return this.direction === "horizontal";
    }

    protected update(changedProperties)
    {
        super.update(changedProperties);

        const isHorizontal = this.isHorizontal();
        const width = this.width;
        const style = this.style;

        style.padding = isHorizontal ? `0 ${width}px` : `${width}px 0`;
        style.margin = isHorizontal ? `0 ${-width}px` : `${-width}px 0`;
        style.cursor = isHorizontal ? "col-resize" : "row-resize";
    }

    protected createRenderRoot()
    {
        return this;
    }

    protected onPointerDown(event: PointerEvent)
    {
        if (event.isPrimary) {
            this.isActive = true;

            this.setPointerCapture(event.pointerId);
            const rect = this.getBoundingClientRect();
            this.offset = this.isHorizontal()
                ? rect.left + rect.width * 0.5 - event.clientX
                : rect.top + rect.height * 0.5 - event.clientY;
        }
    }

    protected onPointerMove(event: PointerEvent)
    {
        if (event.isPrimary && this.isActive) {
            const parent = this.parentElement;
            if (!parent) {
                return;
            }

            const rect = parent.getBoundingClientRect();

            const isHorizontal = this.isHorizontal();

            const parentSize = isHorizontal ? rect.width : rect.height;
            const position = this.offset + (isHorizontal ? event.clientX - rect.left : event.clientY - rect.top);
            this.position = position;

            this.dispatchEvent(new CustomEvent(Splitter.changeEvent, {
                detail: {
                    direction: this.direction,
                    position: this.position,
                    isDragging: true
                }
            }) as ISplitterChangeEvent);

            if (!this.detached) {
                const prevElement = this.previousElementSibling;
                const nextElement = this.nextElementSibling;

                if (prevElement instanceof HTMLElement && nextElement instanceof HTMLElement) {
                    const children = Array.from(parent.children);
                    let splitAreaStart = 0;
                    let splitAreaSize = parentSize;
                    let visited = false;

                    children.forEach(child => {
                        if (child instanceof Splitter) {
                            return;
                        }

                        if (child === prevElement || child === nextElement) {
                            visited = true;
                            return;
                        }

                        const childRect = child.getBoundingClientRect();
                        const childSize = isHorizontal ? childRect.width : childRect.height;
                        splitAreaSize -= childSize;

                        if (!visited) {
                            splitAreaStart += childSize;
                        }
                    });

                    const minSize = this.margin;
                    const maxSize = splitAreaSize - minSize;

                    let prevSize = (position - splitAreaStart);
                    prevSize = prevSize < minSize ? minSize : (prevSize > maxSize ? maxSize : prevSize);

                    const nextSize = (splitAreaSize - prevSize) / parentSize;
                    prevSize = prevSize / parentSize;

                    prevElement.style.flexBasis = (prevSize * 100).toFixed(3) + "%";
                    nextElement.style.flexBasis = (nextSize * 100).toFixed(3) + "%";
                }
            }
        }
    }

    protected onPointerUp(event: PointerEvent)
    {
        if (event.isPrimary) {
            this.isActive = false;

            this.dispatchEvent(new CustomEvent(Splitter.changeEvent, {
                detail: {
                    direction: this.direction,
                    position: this.position,
                    isDragging: false
                }
            }) as ISplitterChangeEvent);
        }
    }
}