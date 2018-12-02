/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property, html, PropertyValues } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-line-edit")
export default class LineEdit extends CustomElement
{
    @property({ type: String })
    text = "";

    @property({ type: String })
    placeholder = "";

    protected initialValue: string = "";

    protected firstUpdated()
    {
        this.style.display = "block";
        this.classList.add("ff-control", "ff-line-edit");
    }

    render()
    {
        return html`
            <input
             type="text" value=${this.text} placeholder=${this.placeholder}
             @keydown=${this.onKeyDown} @change=${this.onChange} @input=${this.onInput} @focus=${this.onFocus} @blur=${this.onBlur}
             style="box-sizing: border-box; width:100%;">
        `;
    }

    protected onKeyDown(event: KeyboardEvent)
    {
        const target = event.target as HTMLInputElement;

        if (event.key === "Enter") {
            this.commit(target);
            target.blur();
        }
        else if (event.key === "Escape") {
            this.revert(target);
            target.blur();
        }
    }

    protected onChange(event)
    {
        console.log("onChange", event);
    }

    protected onInput(event)
    {
        console.log(event.target.value);
    }

    protected onFocus(event)
    {
        this.initialValue = event.target.value;
        event.target.select();
    }

    protected onBlur(event)
    {

    }

    protected revert(element: HTMLInputElement)
    {
        element.value = this.initialValue;
    }

    protected commit(element: HTMLInputElement)
    {
        this.initialValue = element.value;
    }
}