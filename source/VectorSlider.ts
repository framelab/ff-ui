/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";
import Vector2, { IVector2 } from "@ff/core/Vector2";

import CustomElement, { customElement, html } from "./CustomElement";
import SliderElement from "./SliderElement";

////////////////////////////////////////////////////////////////////////////////

export interface IVectorSliderValueEvent
{
    type: "value";
    target: VectorSlider;
    detail: {
        value: Vector2;
        dragging: boolean;
    }
}

@customElement("ff-vector-slider")
export default class VectorSlider extends SliderElement
{
    private _knob;
    private _value = new Vector2();

    constructor()
    {
        super();

        this._knob = new CustomElement()
            .addClass("ff-knob")
            .setStyle({ position: "absolute" });
    }

    set value(value: Vector2) {
        this._value.copy(value);
        this.updateKnob();
    }
    get value() {
        return this._value;
    }

    protected firstConnected()
    {
        this.classList.add("ff-control", "ff-vector-slider");
    }

    protected render()
    {
        return html`<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">
            ${this._knob}`;
    }

    protected updated(): void
    {
        this.updateKnob();
    }

    protected updateKnob()
    {
        const cr = this.getBoundingClientRect();
        const knob = this._knob;
        const x = this._value.x * (cr.width - knob.clientWidth);
        const y = (1 - this._value.y) * (cr.height - knob.clientHeight);
        this._knob.style.left = `${x}px`;
        this._knob.style.top = `${y}px`;
    }

    protected drag(event: PointerEvent)
    {
        const cr = this.getBoundingClientRect();
        const knob = this._knob;
        const x = (event.clientX - cr.left - knob.clientWidth * 0.8) / (cr.width - knob.clientWidth);
        const y = 1 - (event.clientY - cr.top - knob.clientHeight * 0.8) / (cr.height - knob.clientHeight);
        this.value = this.value.set(math.limit(x, 0, 1), math.limit(y, 0, 1));

        this.dispatchEvent(new CustomEvent("value", {
            detail: {
                value: this.value,
                dragging: true
            },
            bubbles: true
        }));
    }

    protected commit()
    {
        this.dispatchEvent(new CustomEvent("value", {
            detail: {
                value: this._value,
                dragging: false
            },
            bubbles: true
        }));
    }
}