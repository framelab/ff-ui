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

    protected observer = new MutationObserver(this.onObserver);

    protected onInitialConnect()
    {
        this.setStyle({
            flex: "1 1 auto",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap"
        });

        this.classList.add("ff-control", "ff-button");
    }

    protected onConnect()
    {
        this.observer.observe(this, { childList: true });
    }

    protected onDisconnect()
    {
        this.observer.disconnect();
    }

    protected render()
    {
        const icon = this.icon ? html`<span class=${"ff-icon " + this.icon}></span>` : null;
        const text = this.text ? html`<span class="ff-text">${this.text}</span>` : null;

        return html`
            <button @click=${this.onClick} style="width: 100%; height: 100%;">
                ${icon}
                ${text}
            </button>
        `;
    }

    protected onObserver(mutations)
    {
        mutations.forEach(mutation => {
            if (mutation.type === "childList") {
                // TODO
            }
        });
    }

    protected onClick()
    {
        if (this.selectable) {
            this.selected = !this.selected;
        }
    }
}
