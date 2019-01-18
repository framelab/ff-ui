/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";

import CustomElement, { property, PropertyValues, customElement, html } from "./CustomElement";
import SliderElement from "./SliderElement";

////////////////////////////////////////////////////////////////////////////////

export type SliderDirection = "horizontal" | "vertical";

export interface ILinearSliderChangeEvent extends CustomEvent
{
    type: "change";
    target: LinearSlider;
    detail: {
        value: number;
        isDragging: boolean;
    }
}

@customElement("ff-linear-slider")
export default class LinearSlider extends SliderElement
{
    @property({ type: String })
    direction: SliderDirection = "horizontal";

    @property({ type: Number })
    value = 0;

    private _isVertical = false;
    private _knob: CustomElement;

    constructor()
    {
        super();

        this._knob = new CustomElement()
            .addClass("ff-knob")
            .setStyle({ position: "absolute", visibility: "hidden" });
    }

    protected firstConnected()
    {
        this.setStyle({
            position: "relative",
            touchAction: "none"
        });

        this.setAttribute("touch-action", "none");
        this.setAttribute("tabindex", "0");

        this.classList.add("ff-control", "ff-linear-slider");

        setTimeout(() => {
            this._knob.style.visibility = "visible";
            this.updated();
        });
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

    protected render()
    {
        return html`${this._knob}`;
    }

    protected updated()
    {
        const cr = this.getBoundingClientRect();
        const knob = this._knob;
        const x = this._isVertical ? 0 : this.value * (cr.width - knob.clientWidth);
        const y = this._isVertical ? (1 - this.value) * (cr.height - knob.clientHeight) : 0;
        this._knob.style.left = `${x}px`;
        this._knob.style.top = `${y}px`;
    }

    protected drag(event: PointerEvent)
    {
        const cr = this.getBoundingClientRect();
        const knob = this._knob;
        let v = this._isVertical
            ? 1 - (event.clientY - cr.top - knob.clientHeight * 0.8) / (cr.height - knob.clientHeight)
            : (event.clientX - cr.left - knob.clientWidth * 0.8) / (cr.width - knob.clientWidth);
        v = math.limit(v, 0, 1);

        if (v !== this.value) {
            this.value = v;
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