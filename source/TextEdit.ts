/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property, html, PropertyValues } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-text-edit")
export default class TextEdit extends CustomElement
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