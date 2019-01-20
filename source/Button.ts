/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property, html, PropertyValues } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

/**
 * Emitted by [[Button]] if clicked.
 * @event
 */
export interface IButtonClickEvent extends MouseEvent
{
    type: "click";
    target: Button;
}

/**
 * Custom element displaying a button with a text and/or an icon.
 * The button emits a [[IButtonClickEvent]] if clicked.
 * Classes assigned: "ff-button", "ff-control".
 */
@customElement("ff-button")
export default class Button extends CustomElement
{
    /** Optional name to identify the button. */
    @property({ type: String })
    name = "";

    /** Optional index to identify the button. */
    @property({ type: Number })
    index = 0;

    /** If true, adds "ff-selected" class to element. */
    @property({ type: Boolean, reflect: true })
    selected = false;

    /** If true, toggles selected state every time the button is clicked. */
    @property({ type: Boolean })
    selectable = false;

    /** Optional text to be displayed on the button. */
    @property()
    text: string;

    /** Optional name of the icon to be displayed on the button. */
    @property()
    icon = "";

    /** If true, displays a downward facing triangle at the right side. */
    @property({ type: Boolean })
    caret = false;

    @property({ type: Boolean })
    inline = false;

    constructor()
    {
        super();

        this.addEventListener("click", (e) => this.onClick(e));
        this.addEventListener("keydown", (e) => this.onKeyPress(e));
    }

    protected firstConnected()
    {
        if (this.inline) {
            this.classList.add("ff-inline", "ff-button");
        }
        else {
            this.classList.add("ff-control", "ff-button");
        }

        this.tabIndex = 0;
    }

    protected render()
    {
        return html`${this.renderIcon()}${this.renderText()}${this.renderCaret()}`;
    }

    protected renderIcon()
    {
        return this.icon ? html`<ff-icon class="ff-off" name=${this.icon}></ff-icon>` : null;
    }

    protected renderText()
    {
        return this.text ? html`<div class="ff-text ff-off">${this.text}</div>` : null;
    }

    protected renderCaret()
    {
        return this.caret ? html`<div class="ff-caret-down"></div>` : null;
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
