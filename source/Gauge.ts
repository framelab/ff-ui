/**
 * FF Typescript Foundation Library
 * Copyright 2020 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";
import CustomElement, { customElement, property, html } from "./CustomElement";
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
export default class Gauge extends CustomElement implements IDragTarget
{
    protected static readonly classes = [ "ff-control", "ff-knob" ];

    /** Optional name to identify the component. */
    @property({ type: String })
    name = "";

    /** Optional index to identify the component. */
    @property({ type: Number })
    index = 0;

    @property({ type: Number })
    value = 0;

    @property({ type: Number })
    speed = 1;



    constructor()
    {
        super();

        // observe size changes, note that ResizeObserver is not defined in TS yet
        // const ResizeObserver = (window as any).ResizeObserver;
        // if (ResizeObserver) {
        //     new ResizeObserver(() => this.onResize()).observe(this);
        // }

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

    protected render()
    {
        const w = 6;
        const r = 50 - w * 0.5;

        const gap = 60;
        const a = 90 + (gap * 0.5);
        const fb = 1 - (360 - gap) / 360;
        const fo = 1 - this.value * (360 - gap) / 360;
        const x = gap * 0.5 + this.value * (360 - gap) - 90;

        return html`<svg viewBox="0 0 100 100" stroke-dasharray="1 10">
            <g transform-origin="50 50" transform="rotate(${a})">
                <circle cx="50" cy="50" r=${r} stroke="#808080" fill="none" pathLength="1" stroke-dashoffset="${fb}" /> 
                <circle cx="50" cy="50" r=${r} fill="none" pathLength="1" stroke-dashoffset="${fo}" /> 
            </g>
            <g transform-origin="50 50" transform="rotate(${x})">
                <circle cx="50" cy="50" r="30" stroke="none" fill="#a0a0a0"></circle>
                <line x1="20" y1="50" x2="50" y2="50" pathLength="1"></line>
            </g>
        </svg>`;
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

}
