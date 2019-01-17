/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";

import CustomElement, { property, PropertyValues, customElement, html } from "./CustomElement";
import SliderElement from "./SliderElement";

import VectorSlider from "./VectorSlider";

////////////////////////////////////////////////////////////////////////////////

export type SliderDirection = "horizontal" | "vertical";

export interface ILinearSliderValueEvent
{
    type: "value";
    target: VectorSlider;
    detail: {
        value: number;
        dragging: boolean;
    }
}

@customElement("ff-linear-slider")
export default class Slider extends SliderElement
{
    @property({ type: String })
    direction: SliderDirection = "horizontal";

    private _isVertical = false;
    private _knob: CustomElement;
    private _value = 0;

    constructor()
    {
        super();

        this._knob = new CustomElement()
            .addClass("ff-knob")
            .setStyle({ position: "absolute" });
    }

    set value(value: number) {
        this._value = value;
        this.updateKnob();
    }
    get value() {
        return this._value;
    }

    protected firstConnected()
    {
        this.classList.add("ff-control", "ff-slider");
        this.updateKnob();
    }

    protected update(changedProperties: PropertyValues): void
    {
        if (changedProperties.has("direction")) {
            this._isVertical = this.direction === "vertical";
            this.setClass("ff-horizontal", !this._isVertical);
            this.setClass("ff-vertical", this._isVertical);
        }

        super.update(changedProperties);
    }

    protected updateKnob()
    {
        const cr = this.getBoundingClientRect();
        const knob = this._knob;
        const x = this._isVertical ? 0 : this._value * (cr.width - knob.clientWidth);
        const y = this._isVertical ? this._value * (cr.height - knob.clientHeight) : 0;
        this._knob.style.left = `${x}px`;
        this._knob.style.top = `${y}px`;
    }

    protected drag(event: PointerEvent)
    {
        const cr = this.getBoundingClientRect();
        const knob = this._knob;
        const v = this._isVertical
            ? (event.clientY - cr.top - knob.clientHeight * 0.8) / (cr.height - knob.clientHeight)
            : (event.clientX - cr.left - knob.clientWidth * 0.8) / (cr.width - knob.clientWidth);
        this.value = math.limit(v, 0, 1);

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