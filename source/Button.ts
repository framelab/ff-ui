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
    target: Button;
}

@customElement("ff-button")
export default class Button extends CustomElement
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
        const icon = this.icon ? html`<div class=${"ff-disabled ff-icon " + this.icon}></div>` : null;
        const text = this.text ? html`<div class="ff-disabled ff-text">${this.text}</div>` : null;

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
        if (document.activeElement === this && event.code === "Space") {
            this.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }
    }
}
