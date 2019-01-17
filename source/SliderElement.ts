/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export { customElement, property, html, PropertyValues } from "./CustomElement";

export default class SliderElement extends CustomElement
{
    protected isActive = false;

    constructor()
    {
        super();

        this.addEventListener("pointerdown", this.onPointerDown.bind(this));
        this.addEventListener("pointermove", this.onPointerMove.bind(this));

        this.onPointerUp = this.onPointerUp.bind(this);
        this.addEventListener("pointerup", this.onPointerUp);
        this.addEventListener("pointercancel", this.onPointerUp);
    }

    protected onPointerDown(event: PointerEvent)
    {
        if (event.isPrimary) {
            this.isActive = true;
            this.setPointerCapture(event.pointerId);
            this.drag(event);
        }

        event.stopPropagation();
        event.preventDefault();
    }

    protected onPointerMove(event: PointerEvent)
    {
        if (this.isActive && event.isPrimary) {
            this.drag(event);
        }

        event.stopPropagation();
        event.preventDefault();
    }

    protected onPointerUp(event: PointerEvent)
    {
        if (event.isPrimary) {
            this.commit();
            this.releasePointerCapture(event.pointerId);
            this.isActive = false;
        }

        event.stopPropagation();
        event.preventDefault();
    }

    protected drag(event: PointerEvent)
    {
    }

    protected commit()
    {
    }
}