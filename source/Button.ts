/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import LitElement, { customElement, property, html } from "./LitElement";

////////////////////////////////////////////////////////////////////////////////

export interface IButtonClickEvent extends MouseEvent
{
    currentTarget: Button;
}

@customElement("ff-button")
export default class Button extends LitElement
{
    @property({ type: String })
    name = "";

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

    constructor()
    {
        super();

        this.addEventListener("click", (e) => this.onClick(e));
        this.addEventListener("keydown", (e) => this.onKeyPress(e));
    }

    protected render()
    {
        const icon = this.icon ? html`<div class=${"ff-icon " + this.icon}></div>` : null;
        const text = this.text ? html`<div class="ff-text">${this.text}</div>` : null;

        // return html`
        //     <button @click=${this.onClick} style="width: 100%; height: 100%;">
        //         ${icon}
        //         ${text}
        //     </button>
        // `;

        return html`${icon}${text}`;
    }

    protected firstUpdated()
    {
        this.setStyle({
            flex: "1 1 auto",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap"
        });

        this.classList.add("ff-control", "ff-button");
        this.tabIndex = 0;
    }

    protected onClick(event: MouseEvent)
    {
        if (this.selectable) {
            this.selected = !this.selected;
        }
    }

    protected onKeyPress(event: KeyboardEvent)
    {
        if (event.code === "Space") {
            this.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }
    }
}
