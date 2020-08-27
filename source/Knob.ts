/**
 * FF Typescript Foundation Library
 * Copyright 2020 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property, html, PropertyValues } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

/**
 * Emitted by [[Knob]] when the knob's value has changed.
 * @event
 */
export interface IKnobChangeEvent extends CustomEvent
{
    type: "change";
    target: Knob;
    detail: {
        value: number;
        isDragging: boolean;
    }
}

/**
 * Custom HTML element displaying an adjustable knob. The knob's position can be
 * changed by touch/click and drag up/down or left/right.
 *
 * ### Events
 * - *"change"* - [[IKnobChangeEvent]] emitted when the knob's value has changed.
 */
@customElement("ff-knob")
export default class Knob extends CustomElement
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

    private _context: CanvasRenderingContext2D;

    constructor()
    {
        super();

        const canvas = this.appendElement("canvas");
        this._context = canvas.getContext("2d");
    }

    protected updated()
    {
        this.draw(this._context);
    }

    protected draw(context: CanvasRenderingContext2D)
    {
        const width = context.canvas.width;
        const height = context.canvas.height;
        console.log(width, height);

        context.fillRect(10, 10, 20, 20);
    }

    // protected render()
    // {
    //     return html`<canvas></canvas><div>Hello</div>`;
    // }
}
