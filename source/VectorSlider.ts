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
        .setStyle({ display: "block", position: "relative "});
    }

    setXY(x: number, y: number)
    {
        this.value.set(x, y);
        this.requestUpdate();
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

        this.appendChild(this._knob);
    }

    protected update(changedProperties: PropertyValues): void
    {
        const x = this.value.x * 100;
        const y = (1 - this.value.y) * 100;
        this._knob.style.left = `${x.toFixed(3)}%`;
        this._knob.style.top = `${y.toFixed(3)}%`;

        super.update(changedProperties);
    }

    protected drag(event: PointerEvent)
    {
        const knob = this._knob;
        let x = (event.clientX - this.offsetLeft - knob.offsetWidth * 0.8) / (this.offsetWidth - knob.offsetWidth);
        x = math.limit(x, 0, 1);
        let y = 1 - (event.clientY - this.offsetTop - knob.offsetHeight * 0.8) / (this.offsetHeight - knob.offsetHeight);
        y = math.limit(y, 0, 1);

        if (x !== this.value.x || y !== this.value.y) {
            this.value = this.value.set(x, y);
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