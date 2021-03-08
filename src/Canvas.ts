/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

/**
 * Fired after canvas is mounted and before canvas is unmounted.
 * After mounting, the canvas property contains the HTML canvas element.
 * Before unmounting, the canvas property is null.
 */
export interface ICanvasMountEvent extends CustomEvent
{
    detail: {
        /** The HTML canvas element or null if the component is about to unmount. */
        canvas: HTMLCanvasElement | null;
    }
}

@customElement("ff-canvas")
export class Canvas extends CustomElement
{
    static readonly mountEvent = "mount";

    protected canvas: HTMLCanvasElement;

    constructor()
    {
        super();

        const canvas = this.canvas = document.createElement("canvas");
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        this.appendChild(canvas);
    }

    protected connected()
    {
        this.dispatchEvent(new CustomEvent(Canvas.mountEvent, {
            detail: { canvas: this.canvas }
        }) as ICanvasMountEvent);
    }

    protected disconnected()
    {
        this.dispatchEvent(new CustomEvent(Canvas.mountEvent, {
            detail: { canvas: null }
        }) as ICanvasMountEvent);
    }
}