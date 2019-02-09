/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property, html, PropertyValues } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export type TextAlign = "left" | "right" | "center";

export interface ITextEditChangeEvent extends CustomEvent
{
    type: "change";
    target: TextEdit;
    detail: {
        text: string;
        isEditing: boolean;
    }
}

@customElement("ff-text-edit")
export default class TextEdit extends CustomElement
{
    /** Optional name to identify the button. */
    @property({ type: String })
    name = "";

    /** Optional index to identify the button. */
    @property({ type: Number })
    index = 0;

    /** Text to be edited in the control. */
    @property({ type: String })
    text = "";

    /** Placeholder text to display if no other text is present. */
    @property({ type: String })
    placeholder = "";

    @property({ type: String })
    align: TextAlign = "left";

    protected initialValue: string = "";

    hasFocus()
    {
        return this.getElementsByTagName("input")[0] === document.activeElement;
    }

    protected firstConnected()
    {
        this.classList.add("ff-control", "ff-text-edit");
    }

    protected shouldUpdate(changedProperties: PropertyValues): boolean
    {
        if (this.hasFocus()) {
            return false;
        }

        return super.shouldUpdate(changedProperties);
    }

    protected render()
    {
        return html`<textarea
            .value=${this.text} placeholder=${this.placeholder}
            @keydown=${this.onKeyDown} @change=${this.onChange} @input=${this.onInput}
            @focus=${this.onFocus} @blur=${this.onBlur}
            style="text-align: ${this.align};"></textarea>`;
    }

    protected onKeyDown(event: KeyboardEvent)
    {
        const target = event.target as HTMLTextAreaElement;

        if (event.key === "Escape") {
            this.revert(target);
            target.blur();
        }
    }

    protected onChange(event)
    {
        event.stopPropagation();
        event.preventDefault();

        this.dispatchChangeEvent(event.target.value, false);
    }

    protected onInput(event)
    {
        event.stopPropagation();
        event.preventDefault();

        this.dispatchChangeEvent(event.target.value, true);
    }

    protected onFocus(event)
    {
        this.initialValue = event.target.value;
    }

    protected onBlur(event)
    {
        this.commit(event.target);
    }

    protected revert(element: HTMLTextAreaElement)
    {
        element.value = this.initialValue;
        this.dispatchChangeEvent(element.value, false);
    }

    protected commit(element: HTMLInputElement)
    {
        this.initialValue = element.value;
        this.dispatchChangeEvent(element.value, false);
    }

    protected dispatchChangeEvent(text: string, isEditing: boolean)
    {
        this.dispatchEvent(new CustomEvent("change", {
            detail: {
                text,
                isEditing
            }
        }));
    }
}