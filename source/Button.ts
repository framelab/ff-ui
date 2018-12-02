/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property, html } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export interface IButtonClickEvent extends MouseEvent
{
    currentTarget: Button;
}

@customElement("ff-button")
export default class Button extends CustomElement
{
    @property({ type: String })
    name = "a";

    @property({ type: Number })
    index = 0;

    @property({ type: Boolean, reflect: true })
    selected = false;

    @property({ type: Boolean })
    selectable = false;

    @property()
    text: string;

    @property()
    icon = "";

    protected firstUpdated()
    {
        this.setStyle({
            flex: "1 1 auto",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap"
        });

        this.classList.add("ff-control", "ff-button");
    }

    protected render()
    {
        const icon = this.icon ? html`<div class=${"ff-icon " + this.icon}></div>` : null;
        const text = this.text ? html`<div class="ff-text">${this.text}</div>` : null;

        return html`
            <button @click=${this.onClick} style="width: 100%; height: 100%;">
                ${icon}
                ${text}
            </button>
        `;
    }

    protected onClick()
    {
        if (this.selectable) {
            this.selected = !this.selected;
        }
    }
}
