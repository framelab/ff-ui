/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import DragHelper from "./DragHelper";
import CustomElement, { customElement, property, html, PropertyValues } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-title-bar")
export default class TitleBar extends CustomElement
{
    protected static readonly closeIcon: string = "ff-icon fa fas fa-times";

    @property({ type: String })
    title = "";

    @property({ type: Boolean })
    draggable = false;

    @property({ type: Boolean })
    closable = false;

    private dragHelper: DragHelper;

    constructor()
    {
        super();

        this.dragHelper = new DragHelper(this.parentElement);

        this.addEventListener("pointerdown", (e) => this.dragHelper.onPointerDown(e));
        this.addEventListener("pointermove", (e) => this.dragHelper.onPointerMove(e));
        this.addEventListener("pointerup", (e) => this.dragHelper.onPointerUp(e));
    }

    protected update(changedProperties: PropertyValues)
    {
        this.dragHelper.enabled = this.draggable;
        this.style.cursor = this.draggable ? "pointer" : "default";

        super.update(changedProperties);
    }

    protected render()
    {
        const title = this.title || " ";
        const closeIcon = this.closable ? html`<button class=${TitleBar.closeIcon}></button>` : null;

        return html`
            <div class="ff-text">${title}</div>
            ${closeIcon}
        `;
    }

    protected firstUpdated()
    {
        this.setStyle({
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center"
        });
    }

}