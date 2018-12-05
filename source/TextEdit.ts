/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import LitElement, { customElement, property, html, PropertyValues } from "./LitElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-text-edit")
export default class TextEdit extends LitElement
{
    @property({ type: String })
    text: "";

    render()
    {
        return html`
            <input type="text">
        `;
    }
}