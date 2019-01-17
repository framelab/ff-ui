/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { customElement, property, html } from "./CustomElement";

import Button, { IButtonClickEvent } from "./Button";
import "./Menu";
import { IMenuEntry } from "./Menu";

////////////////////////////////////////////////////////////////////////////////

export type DropdownDirection = "up" | "down";
export type DropdownAlign = "left" | "right";

@customElement("ff-dropdown")
export default class Dropdown extends Button
{
    /** Direction of the dropdown menu. Possible values: "down" (default), "up". */
    @property({ type: String })
    direction: DropdownDirection = "down";

    @property({ type: String })
    align: DropdownAlign = "left";

    /** Entries to be displayed in the dropdown menu. */
    @property({ attribute: false })
    entries: IMenuEntry[] = [];

    constructor()
    {
        super();
        this.caret = true;
        this.onPointerDown = this.onPointerDown.bind(this);

    }

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("ff-dropdown");
    }

    protected connected()
    {
        super.connected();
        document.addEventListener("pointerdown", this.onPointerDown, { capture: true, passive: true });
    }

    protected disconnected()
    {
        super.disconnected();
        document.removeEventListener("pointerdown", this.onPointerDown);
    }

    protected render()
    {
        const classes = (this.direction === "up" ? "ff-position-above " : "ff-position-below ")
            + (this.align === "right" ? "ff-align-right" : "ff-align-left");

        const menu = this.selected ? html`<ff-menu class=${classes} .entries=${this.entries}></ff-menu>` : null;
        return html`${super.render()}${menu}`;
    }

    protected onClick(event: MouseEvent)
    {
        this.selected = !this.selected;
    }

    protected onPointerDown(event: PointerEvent)
    {
        if (this.selected && !(event.target instanceof Node && this.contains(event.target))) {
            this.selected = false;
        }
    }
}