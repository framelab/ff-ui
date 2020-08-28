/**
 * FF Typescript Foundation Library
 * Copyright 2020 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";
import CustomElement, { customElement, property } from "./CustomElement";
import DragHelper, { IDragTarget } from "./DragHelper";

////////////////////////////////////////////////////////////////////////////////

export interface IGaugeChangeEvent extends CustomElement
{
    type: "change",
    target: Gauge;
    detail: {
        value: number;
        isDragging: boolean;
    }
}

@customElement("ff-gauge")
export default class Gauge extends CustomElement
{
    protected readonly classes = [ "ff-control", "ff-knob" ];

    /** Optional name to identify the component. */
    @property({ type: String })
    name = "";

    /** Optional index to identify the component. */
    @property({ type: Number })
    index = 0;

    @property({ type: Number })
    value = 0;

    @property({ type: Number })
    gap = 60;

    @property({ type: Number })
    speed = 1;


    private _context: CanvasRenderingContext2D;


    constructor()
    {
        super();

        const canvas = this.appendElement("canvas");
        this._context = canvas.getContext("2d");

        // observe size changes, note that ResizeObserver is not defined in TS yet
        const ResizeObserver = (window as any).ResizeObserver;
        if (ResizeObserver) {
            new ResizeObserver(() => this.onResize()).observe(this);
        }

        new DragHelper(this);
    }

    dragStart(event: PointerEvent)
    {

    }

    dragMove(event: PointerEvent, dx: number, dy: number)
    {
        const delta = dx - dy;
        const multiplier = (event.shiftKey ? 5 : 1) * (event.ctrlKey ? 0.2 : 1);
        const speed = this.speed * 0.75 / this.clientWidth;

        const v = math.limit(this.value + delta * speed * multiplier, 0, 1);

        if (v !== this.value) {
            this.value = v;
            this.emitChangeEvent(true);
        }
    }

    dragEnd(event: PointerEvent)
    {
        this.emitChangeEvent(false);
    }

    protected updated()
    {
        this.draw(this._context);
    }

    protected draw(context: CanvasRenderingContext2D)
    {
        const style = getComputedStyle(this);
        const backgroundColor = style.getPropertyValue("--meter-background") || "#303030";
        const strokeColor = style.getPropertyValue("--meter-color") || "#90e000";
        const textColor = style.color;
        const gap = parseFloat(style.getPropertyValue("--meter-gap")) || this.gap;
        const thickness = parseFloat(style.getPropertyValue("--meter-thickness")) || 1;

        const width = context.canvas.width;
        const height = context.canvas.height;
        const size = Math.min(width, height);
        const cx = width * 0.5;
        const cy = size * 0.5;
        const lineWidth = size * 0.1 * thickness;
        const radius = cy - lineWidth * 0.5;

        const start = 90 + gap * 0.5;
        const arc = 360 - gap;
        const end = start + arc;
        const value = math.limit(this.value, 0, 1);
        const bar = start + arc * value;

        context.clearRect(0, 0, width, height);
        context.lineWidth = lineWidth;

        // background
        context.strokeStyle = backgroundColor;
        context.beginPath();
        context.ellipse(cx, cy, radius, radius, 0, start * math.DEG2RAD, end * math.DEG2RAD);
        context.stroke();

        // foreground
        context.strokeStyle = strokeColor;
        context.beginPath();
        context.ellipse(cx, cy, radius, radius, 0, start * math.DEG2RAD, bar * math.DEG2RAD);
        context.stroke();

        // text
        context.font = `${style.fontSize} ${style.fontFamily}`;
        context.fillStyle = textColor;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(`${(value * 100).toFixed()} Hz`, cx, cy, radius * 1.5);
    }

    protected emitChangeEvent(isDragging: boolean)
    {
        this.dispatchEvent(new CustomEvent("change", {
            detail: {
                value: this.value,
                isDragging
            },
            bubbles: true
        }));
    }

    protected onResize()
    {
        const canvas = this._context.canvas;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        this.draw(this._context);
    }
}
