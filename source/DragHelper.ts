/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

export default class DragHelper
{
    readonly element: HTMLElement;
    enabled = true;

    protected isActive = false;
    protected offsetX = 0;
    protected offsetY = 0;

    constructor(element: HTMLElement)
    {
        if (!element) {
            throw new Error("missing element");
        }

        this.element = element;
    }

    onPointerDown(event: PointerEvent)
    {
        if (event.isPrimary && this.enabled) {
            this.isActive = true;
            console.log("DragHelper.onPointerDown");

            const rect = this.element.getBoundingClientRect();
            this.offsetX = rect.left - event.clientX;
            this.offsetY = rect.top - event.clientY;

            (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        }
    }

    onPointerMove(event: PointerEvent)
    {
        if (event.isPrimary && this.isActive) {
            console.log("DragHelper.onPointerMove");

            const element = this.element;
            const parent = element.parentElement;
             if (!parent) {
                 return;
             }

             const parentRect = parent.getBoundingClientRect();
             element.style.left = (event.clientX + this.offsetX - parentRect.left) + "px";
             element.style.top = (event.clientY + this.offsetY - parentRect.top) + "px";

             //event.stopPropagation();
             //event.preventDefault();
        }
    }

    onPointerUp(event: PointerEvent)
    {
        if (event.isPrimary && this.isActive) {
            console.log("DragHelper.onPointerUp");
            this.isActive = false;
            //event.stopPropagation();
            //event.preventDefault();
        }
    }
}