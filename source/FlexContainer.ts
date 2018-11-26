/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { LitElement, html, customElement, property } from "@polymer/lit-element";

////////////////////////////////////////////////////////////////////////////////

export class FlexContainer extends LitElement
{
    @property()
    direction: "horizontal" | "vertical";

    @property()
    position: "relative" | "absolute" | "fill";

    constructor()
    {
        super();
        this.direction = "horizontal";
        this.position = "fill";
    }

    render()
    {
        return html`
            <style>
                :host {
                    position: ${this.position === "relative" ? "relative" : "absolute"};
                }
            </style>
        `;
    }
}

customElements.define("ff-flex-container", FlexContainer);