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
            .setStyle({ display: "block", position: "relative "});
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

        this.appendChild(this._knob);
    }

    protected update(changedProperties: PropertyValues): void
    {
        if (changedProperties.has("direction")) {
            this._isVertical = this.direction === "vertical";
            this.setClass("ff-horizontal", !this._isVertical);
            this.setClass("ff-vertical", this._isVertical);
        }

        if (changedProperties.has("value")) {
            const x = this._isVertical ? 0 : this.value * 100;
            const y = this._isVertical ? (1 - this.value) * 100 : 0;
            this._knob.style.left = `${x.toFixed(3)}%`;
            this._knob.style.top = `${y.toFixed(3)}%`;
        }

        super.update(changedProperties);
    }

    protected drag(event: PointerEvent)
    {
        const knob = this._knob;
        const px = event.clientX - this.offsetLeft - knob.offsetWidth * 0.8;
        const py = event.clientY - this.offsetTop - knob.offsetHeight * 0.8;

        let v = this._isVertical
            ? 1 - py / (this.offsetHeight - knob.offsetHeight)
            : px / (this.offsetWidth - knob.offsetWidth);

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