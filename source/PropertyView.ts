/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Property from "@ff/core/ecs/Property";
import PropertyField from "./PropertyField";
import CustomElement, { customElement, property, PropertyValues, html } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-property-view")
export default class PropertyView extends CustomElement
{
    @property({ attribute: false })
    property: Property = null;

    protected render()
    {
        const property = this.property;

        let fields;
        if (property.isArray()) {

        }
        else {
            fields = html`<ff-property-field .property=${property}></ff-property-field>`
        }

        return html`
            <div class="ff-name"></div>
            ${fields}
        `;
    }

    protected firstUpdated()
    {
        this.setStyle({
            display: "flex"
        });
    }
}