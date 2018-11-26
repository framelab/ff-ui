/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { LitElement, html, customElement, property } from "@polymer/lit-element";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-button" as any)
export class Button extends LitElement
{
    protected static style = html`
        <style>
            :host {
                display: inline-block;
                cursor: pointer;
            }
            
            :host[hidden] {
                display: none;
            }
            
            button {
                padding: var(--ff-button-padding);
                border: inherit;
                background-color: var(--ff-button-background);
                color: inherit;
                cursor: inherit;
            }
            
            button:hover {
                background-color: var(--ff-button-background-hover);
            }
            
            .selected:not(:hover) {
                background-color: var(--ff-button-background-selected);
            }

        </style>
    `;

    @property({ type: Number })
    index = 0;

    @property({ type: Boolean })
    selected = false;

    @property({ type: Boolean })
    selectable = false;

    @property()
    text: string;

    @property()
    icon = "";

    protected observer = new MutationObserver(this.onObserver);

    constructor()
    {
        super();

        this.text = this.innerText || this.text || "";
    }

    connectedCallback()
    {
        console.log("Button.connectedCallback");
        super.connectedCallback();
        this.observer.observe(this, { childList: true });
    }

    disconnectedCallback()
    {
        console.log("Button.disconnectedCallback");
        super.disconnectedCallback();
        this.observer.disconnect();
    }

    attributeChangedCallback(attrName, oldVal, newVal)
    {
        console.log("Button.attributeChangedCallback");
        super.attributeChangedCallback(attrName, oldVal, newVal);
    }

    render()
    {
        const text = this.text ? html`<span class="text">${this.text}</span>` : null;
        const icon = this.icon ? html`<span class=${this.icon}></span>` : null;

        const className = this.selected ? "selected" : "";

        return html`
            ${Button.style}
            <button class=${className} @click=${this.onClick}>${text}${icon}</button>
        `;
    }

    protected onObserver(mutations)
    {
        mutations.forEach(mutation => {
            if (mutation.type === "childList") {
                this.text = this.innerText || this.text || "";
            }
        });
    }

    protected onClick()
    {
        console.log("Button.onClick - " + this.text);
        if (this.selectable) {
            this.selected = !this.selected;
            console.log(this.selected);
        }
    }
}

declare global {
    interface HTMLElementTagNameMap
    {
        "ff-button": Button
    }
}