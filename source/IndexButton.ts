/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Button from "./Button";
import { customElement, property, PropertyValues } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-index-button")
export default class IndexButton extends Button
{
    @property({ type: Number })
    selectedIndex = -1;

    protected shouldUpdate(changedProperties: PropertyValues)
    {
        if (changedProperties.has("selectedIndex") || changedProperties.has("index")) {
            this.selected = this.index === this.selectedIndex;
        }

        return true;
    }
}