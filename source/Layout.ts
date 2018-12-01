/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property, PropertyValues } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

class FlexContainer extends CustomElement
{
    @property({ type: Boolean })
    wrap = false;

    @property({ type: String })
    justify: "flex-start";

    @property({ type: String })
    align: "stretch";

    update(changedProperties: PropertyValues)
    {
        if (changedProperties.has("wrap")) {
            this.style.flexWrap = this.wrap ? "wrap" : "nowrap";
        }
        if (changedProperties.has("justify")) {
            this.style.justifyContent = this.justify;
        }
        if (changedProperties.has("align")) {
            this.style.alignItems = this.align;
        }

        super.update(changedProperties);
    }
}

/**
 * Container element with a flexbox row layout.
 */
@customElement("ff-flex-row")
export class FlexRow extends FlexContainer
{
    protected onInitialConnect()
    {
        this.setStyle({
            display: "flex",
            flexDirection: "row"
        });
    }
}

/**
 * Container element with a flexbox column layout.
 */
@customElement("ff-flex-column")
export class FlexColumn extends FlexContainer
{
    protected onInitialConnect()
    {
        this.setStyle({
            display: "flex",
            flexDirection: "column"
        });
    }
}