/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Property from "@ff/core/ecs/Property";

import PropertyField from "./PropertyField";
import LitElement, { customElement, property, html } from "./LitElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-property-view")
export default class PropertyView extends LitElement
{
    @property({ attribute: false })
    property: Property = null;

    protected render()
    {
        const property = this.property;

        let fields;
        if (property.isArray()) {
            fields = [];
            for (let i = 0; i < property.elementCount; ++i) {
                const field = new PropertyField();
                field.property = property;
                field.index = i;
                fields.push(field);
            }
        }
        else {
            fields = new PropertyField();
            fields.property = property;
        }

        return html`
            <div class="ff-label"></div>
            <div class="ff-fields">${fields}</div>
        `;
    }

    protected firstUpdated()
    {
        this.setStyle({
            display: "flex"
        });
    }
}