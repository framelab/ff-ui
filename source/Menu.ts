/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property, html } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export interface IMenuEntry
{
    index?: number;
    name?: string;
    text?: string;
    icon?: string;
    checked?: boolean;
    disabled?: boolean;
    divider?: boolean;
    selectedIndex?: number;
    selected?: boolean;
}

export interface IMenuSelectEvent extends CustomEvent
{
    type: "select";
    target: Menu;
    detail: {
        entry: IMenuEntry;
    }
}

@customElement("ff-menu")
export default class Menu extends CustomElement
{
    static readonly iconChecked = "fas fa-check";

    /** Optional name to identify the dropdown. */
    @property({ type: String })
    name = "";

    /** Optional index to identify the dropdown. */
    @property({ type: Number })
    index = 0;

    /** Entries to be displayed in the dropdown menu. */
    @property({ attribute: false })
    entries: IMenuEntry[] = null;

    protected firstConnected()
    {
        this.classList.add("ff-menu");
    }

    protected render()
    {
        const entries = this.entries || [];
        const listElements = entries.map((entry, index) => {
            if (entry.divider) {
                return html`<li class="ff-divider"></li>`;
            }

            return html`<li tabindex="0" data-index=${index} @click=${this.onClick}>
                <div class=${"ff-icon " + (entry.icon ? entry.icon : (entry.checked ? Menu.iconChecked : ""))}></div>
                <div role="menuitem" class="ff-text">${entry.text}</div>
            </li>`;
        });

        return html`<ul role="menu">${listElements}</ul>`;
    }

    protected onClick(event: MouseEvent)
    {
        const element = event.target as HTMLElement;
        const entry = this.entries[element.getAttribute("data-index")];

        if (!entry) {
            return;
        }

        this.dispatchEvent(new CustomEvent("select", {
            detail: { entry },
            bubbles: true
        }) as IMenuSelectEvent);
    }
}