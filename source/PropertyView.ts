/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Property from "@ff/core/ecs/Property";

import "./PropertyField";
import CustomElement, { customElement, property, html } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

const _defaultLabels = [ "X", "Y", "Z", "W" ];

@customElement("ff-property-view")
export default class PropertyView extends CustomElement
{
    @property({ attribute: false })
    property: Property = null;

    protected render()
    {
        const property = this.property;

        if (property.isArray()) {
            if (property.elementCount > 4) {
                return;
            }

            const labels = property.schema.labels || _defaultLabels;
            let fields = [];
            for (let i = 0; i < property.elementCount; ++i) {
                fields.push(html`
                    <div class="ff-label">${labels[i]}</div>
                    <ff-property-field .property=${property} .index=${i}></ff-property-field>
                `);
            }
            return html`${fields}`;
        }

        return html`<ff-property-field .property=${property}></ff-property-field>`;
    }

    protected firstConnected()
    {
        this.setStyle({
            display: "flex",
            overflow: "hidden"
        });

        this.classList.add("ff-property-view");
    }
}