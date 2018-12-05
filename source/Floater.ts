/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import LitElement, { customElement, property, PropertyValues } from "./LitElement";

////////////////////////////////////////////////////////////////////////////////

export type FloaterPosition = "fixed" | "anchor" | "center";
export type FloaterAlign = "start" | "center" | "end";
export type FloaterJustify = FloaterAlign;

@customElement("ff-floater")
export default class Floater extends LitElement
{
    @property({ attribute: false })
    anchor: HTMLElement = null;

    @property({ attribute: false })
    portal: HTMLElement = null;

    @property({ type: String })
    position: FloaterPosition = undefined;

    @property({ type: String })
    align: FloaterAlign = undefined;

    @property({ type: String })
    justify: FloaterJustify = undefined;

    @property({ type: Boolean })
    keepVisible: boolean = false;

    constructor()
    {
        super();
        this.onResize = this.onResize.bind(this);
    }

    protected connected()
    {
        window.addEventListener("resize", this.onResize);
    }

    protected disconnected()
    {
        window.removeEventListener("resize", this.onResize)
    }

    firstUpdate()
    {
        this.style.position = "absolute";
    }

    protected update(changedProperties: PropertyValues)
    {
        super.update(changedProperties);

        let anchorRect, portalRect;
        const thisRect = this.getBoundingClientRect();

        if (this.portal) {
            portalRect = this.portal.getBoundingClientRect();
        }
        else {
            portalRect = {
                left: 0, top: 0,
                right: window.innerWidth, bottom: window.innerHeight,
                width: window.innerWidth, height: window.innerHeight
            };
        }

        if (this.position === "center") {
            this.style.left = Math.round((portalRect.width - thisRect.width) * 0.5) + "px";
            this.style.top = Math.round((portalRect.height - thisRect.height) * 0.5) + "px";
        }
        else if (this.position === "anchor") {
            const anchor = this.anchor || this.parentElement;
            if (anchor) {
                anchorRect = anchor.getBoundingClientRect();
                this.positionToAnchor(thisRect, anchorRect, portalRect)
            }
        }

        if (this.keepVisible && this.position !== "center") {
            this.keepFloaterVisible(thisRect, portalRect);
        }
    }

    protected positionToAnchor(thisRect: ClientRect, anchorRect: ClientRect, portalRect: ClientRect)
    {
        const align = this.align;
        const justify = this.justify;

        let left, top;

        switch(align) {
            case "start":
                left = justify === "center"
                    ? anchorRect.left - thisRect.width - portalRect.left
                    : anchorRect.right - thisRect.width - portalRect.left;
                break;
            case "end":
                left = justify === "center"
                    ? anchorRect.right - portalRect.left
                    : anchorRect.left - portalRect.left;
                break;
            default:
                left = anchorRect.left + (anchorRect.width - thisRect.width) * 0.5 - portalRect.left;
                break;
        }

        switch(justify) {
            case "start":
                top = align === "center"
                    ? anchorRect.top - thisRect.height - portalRect.top
                    : anchorRect.bottom - thisRect.height - portalRect.top;
                break;
            case "end":
                top = align === "center"
                    ? anchorRect.bottom - portalRect.top
                    : anchorRect.top - portalRect.top;
                break;
            default:
                top = anchorRect.top + (anchorRect.height - thisRect.height) * 0.5 - portalRect.top;
                break;
        }

        this.style.left = Math.round(left) + "px";
        this.style.top = Math.round(top) + "px";
    }

    protected keepFloaterVisible(thisRect: ClientRect, portalRect: ClientRect)
    {
        const leftOut = portalRect.left - thisRect.left;
        const rightOut = thisRect.right - portalRect.right;
        const topOut = portalRect.top - thisRect.top;
        const bottomOut = thisRect.bottom - portalRect.bottom;

        let newLeftOut = leftOut;
        let newTopOut = topOut;

        if (leftOut > 0 && rightOut > 0) {
            newLeftOut = (leftOut + rightOut) * 0.5;
        }
        else if (leftOut > 0) {
            newLeftOut = 0;
        }
        else if (rightOut > 0) {
            newLeftOut += rightOut;
        }

        if (topOut > 0 && bottomOut > 0) {
            newTopOut = (topOut + bottomOut) * 0.5;
        }
        else if (topOut > 0) {
            newTopOut = 0;
        }
        else if (topOut > 0) {
            newTopOut += bottomOut;
        }

        const leftDiff = newLeftOut - leftOut;
        this.style.left = Math.round(parseFloat(this.style.left) + leftDiff) + "px";

        const topDiff = newTopOut - topOut;
        this.style.top = Math.round(parseFloat(this.style.top) + topDiff) + "px";
    }

    protected onResize()
    {
        this.requestUpdate();
    }
}