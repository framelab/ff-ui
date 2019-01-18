/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";
import Vector2 from "@ff/core/Vector2";

import CustomElement, { customElement, html, property, PropertyValues } from "./CustomElement";
import SliderElement from "./SliderElement";

////////////////////////////////////////////////////////////////////////////////

export interface IVectorSliderChangeEvent extends CustomEvent
{
    type: "change";
    target: VectorSlider;
    detail: {
        value: Vector2;
        isDragging: boolean;
    }
}

@customElement("ff-vector-slider")
export default class VectorSlider extends SliderElement
{
    @property({ attribute: false })
    value = new Vector2();

    private _knob: CustomElement;

    constructor()
    {
        super();

        this._knob = new CustomElement()
            .addClass("ff-knob")
            .setStyle({ position: "absolute", visibility: "hidden" });
    }

    setXY(x: number, y: number)
    {
        this.value.set(x, y);
        this.updated();
    }

    protected firstConnected()
    {
        this.setStyle({
            position: "relative",
            touchAction: "none"
        });

        this.setAttribute("touch-action", "none");
        this.setAttribute("tabindex", "0");

        this.classList.add("ff-control", "ff-vector-slider");

        setTimeout(() => {
            this._knob.style.visibility = "visible";
            this.updated();
        });
    }

    protected render()
    {
        return html`${this._knob}`;
    }

    protected updated()
    {
        const cr = this.getBoundingClientRect();
        const knob = this._knob;
        const left = this.value.x * (cr.width - knob.clientWidth);
        const top = (1 - this.value.y) * (cr.height - knob.clientHeight);
        this._knob.style.left = `${left}px`;
        this._knob.style.top = `${top}px`;
    }

    protected drag(event: PointerEvent)
    {
        const cr = this.getBoundingClientRect();
        const knob = this._knob;
        let x = (event.clientX - cr.left - knob.clientWidth * 0.8) / (cr.width - knob.clientWidth);
        x = math.limit(x, 0, 1);
        let y = 1 - (event.clientY - cr.top - knob.clientHeight * 0.8) / (cr.height - knob.clientHeight);
        y = math.limit(y, 0, 1);

        if (x !== this.value.x || y !== this.value.y) {
            this.value.set(x, y);
            this.updated();
            this.emitChangeEvent(true);
        }
    }

    protected commit()
    {
        this.emitChangeEvent(false);
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