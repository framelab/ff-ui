/**
 * FF Typescript Foundation Library
 * Copyright 2019 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";
import CustomElement, { customElement, html, property, PropertyValues } from "./CustomElement";
import DragHelper, { IDragTarget } from "./DragHelper";

////////////////////////////////////////////////////////////////////////////////

export interface IDialProperties
{
    label: string;
    min: number;
    max: number;
    format: (v: number) => string;
    precision: number;
    centered: boolean;
    steps: number;
    speed: number;
    popover: boolean;
}

export interface IDialChangeEvent extends CustomElement
{
    type: "change",
    target: Dial;
    detail: {
        value: number;
        isDragging: boolean;
    }
}

@customElement("ff-dial")
export default class Dial extends CustomElement implements IDragTarget
{
    protected static readonly classes = [ "ff-control", "ff-dial" ];

    protected static readonly defaultProps = {
        label: "Cutoff",
        min: 0,
        max: 1,
        format: function(v) { return v.toFixed(this.precision) },
        precision: 2,
        centered: false,
        steps: 0,
        speed: 1,
        popover: true,
    };

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

    @property({ attribute: false })
    props: Partial<IDialProperties> = {}

    private _value = 0;
    private _props: IDialProperties = null;
    private _dragHelper = new DragHelper(this);

    dragStart(event: PointerEvent)
    {
        const props = this._props;
        this._value = (this.value - props.min) / (props.max - props.min);
    }

    dragMove(event: PointerEvent, dx: number, dy: number)
    {
        const props = this._props;

        const delta = dx - dy;
        const multiplier = (event.shiftKey ? 5 : 1) * (event.ctrlKey ? 0.2 : 1);
        const speed = props.speed * 0.75 / this.clientWidth;

        this._value += delta * speed * multiplier;
        const v = props.min + math.limit(this._value, 0, 1) * (props.max - props.min);

        if (v !== this.value) {
            this.value = v;
            this.emitChangeEvent(true);
        }
    }

    dragEnd(event: PointerEvent)
    {
        this.requestUpdate();
        this.emitChangeEvent(false);
    }

    protected update(changedProperties: PropertyValues)
    {
        if (changedProperties.has("props")) {
            this._props = Object.assign({}, Dial.defaultProps, this.props);
        }
        if (changedProperties.has("value")) {
            this.value = math.limit(this.value, this._props.min, this._props.max);
        }

        super.update(changedProperties);
    }

    protected render()
    {
        const isDragging = this._dragHelper.isDragging;
        const props = this._props;

        const value = (this.value - props.min) / (props.max - props.min);

        const arcDegrees = 360 - this.gap;
        const arcRatio = arcDegrees / 360;
        const indicatorAngle = 90 + (this.gap * 0.5);

        const fb = 1 - arcRatio;
        const fo = props.centered ? (value < 0.5 ? 9 : 1) + (0.5 - value) * arcRatio : 1 - value * arcRatio;
        const ao = props.centered ? arcDegrees * 0.5 : 0;
        const tickAngle = this.gap * 0.5 + value * arcDegrees - 90;

        return html`<svg viewBox="0 0 100 100">
            <g transform-origin="50 50" transform="rotate(${indicatorAngle})" stroke-dasharray="1 9">
                <circle class="ff-bed" cx="50" cy="50" r=${45} fill="none" pathLength="1" stroke-dashoffset="${fb}" />
                <circle class="ff-level" cx="50" cy="50" r=${45} fill="none" pathLength="1" stroke-dashoffset="${fo}" transform-origin="50 50" transform="rotate(${ao})" /> 
            </g>
            <g transform-origin="50 50" transform="rotate(${tickAngle})">
                <circle class="ff-knob" cx="50" cy="50" r="33" stroke="none"></circle>
                <line class="ff-mark" x1="17" y1="50" x2="50" y2="50"></line>
            </g>
        </svg>
        ${isDragging && props.popover ? html`<div class="ff-popover">${props.format(this.value)}</div>` : null}
        <div class="ff-label">${props.label}</div>`;
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

