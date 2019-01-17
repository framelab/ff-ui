/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Color from "@ff/core/Color";
import CustomElement, { customElement, property, html } from "./CustomElement";

import "./LinearSlider";
import { ILinearSliderValueEvent} from "./LinearSlider";

import "./VectorSlider";
import { IVectorSliderValueEvent } from "./VectorSlider";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-color-edit")
export default class ColorEdit extends CustomElement
{
    @property({ attribute: false })
    color: Color | number[] = null;

    protected firstConnected()
    {
        this.classList.add("ff-control", "ff-color-edit");
    }

    protected render()
    {
        return html`<ff-vector-slider @value=${this.onVectorValue}></ff-vector-slider>
            <ff-linear-slider direction="vertical" @value=${this.onSliderValue}></ff-linear-slider>`;
    }

    protected onVectorValue(event: IVectorSliderValueEvent)
    {
        console.log(event.detail.value.toString());
    }

    protected onSliderValue(event: ILinearSliderValueEvent)
    {
        console.log(event.detail.value);
    }
}