/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { LitElement, html, customElement, property } from "@polymer/lit-element";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-test" as any)
export class Test extends LitElement
{
    protected static style = html`
        <style>
            :host {
                display: inline-block;
                font-weight: bold;
                background: red;
            }
        </style>
    `;

    @property()
    name = "Foo";

    render()
    {
        return html`
            ${Test.style}
            Hello "${this.name}" from my first Lit Element!
            <slot name="one">default</slot>
        `;
    }
}

