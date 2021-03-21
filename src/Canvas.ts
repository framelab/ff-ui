/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

/**
 * Emitted after canvas is mounted and before canvas is unmounted.
 * After mounting, the canvas property contains the HTML canvas element.
 * Before unmounting, the canvas property is null.
 * Listen to this event to e.g. create a 2d or 3d rendering context after
 * the canvas has been mounted.
 */
export interface ICanvasMountEvent extends CustomEvent
{
    target: Canvas;
    detail: {
        /** The HTML canvas element or null if the component is about to unmount. */
        canvas: HTMLCanvasElement | null;
    }
}

/**
 * Emitted after the canvas has been resized.
 */
export interface ICanvasResizeEvent extends CustomEvent
{
    target: Canvas;
    detail: {
        width: number;
        height: number;        
        canvas: HTMLCanvasElement;
    }
}

/**
 * Wraps a HTMLCanvasElement in div which is easier to position and resize.
 * Provides two custom events: "mount" is emitted after the element has been mounted
 * to the DOM, and before it is unmounted. "resize" is emitted whenever
 * the element changes its width or height.
 */
@customElement("ff-canvas")
export class Canvas extends CustomElement
{
    static readonly mountEvent = "mount";
    static readonly resizeEvent = "resize";

    private _canvas: HTMLCanvasElement;
    private _resizeObserver: ResizeObserver;

    constructor()
    {
        super();

        const canvas = this._canvas = document.createElement("canvas");
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        this.appendChild(canvas);

        this.onResize = this.onResize.bind(this);
        this._resizeObserver = new ResizeObserver(this.onResize);
        this._resizeObserver.observe(canvas);
    }

    get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    protected connected()
    {
        this.dispatchEvent(new CustomEvent(Canvas.mountEvent, {
            detail: { canvas: this._canvas }
        }) as ICanvasMountEvent);
    }

    protected disconnected()
    {
        this.dispatchEvent(new CustomEvent(Canvas.mountEvent, {
            detail: { canvas: null }
        }) as ICanvasMountEvent);
    }

    protected onResize(entries: ResizeObserverEntry[])
    {
        const entry = entries[0];

        this.dispatchEvent(new CustomEvent(Canvas.resizeEvent, {
            detail: {
                canvas: this._canvas,
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            },
        }) as ICanvasResizeEvent);
    }
}