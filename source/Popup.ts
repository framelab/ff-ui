/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export type FloaterPosition = "fixed" | "anchor" | "center";
export type FloaterAlign = "start" | "center" | "end";
export type FloaterJustify = FloaterAlign;

@customElement("ff-popup")
export default class Popup extends CustomElement
{
    static readonly closeEvent = "ff-close";

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

    @property({ type: Number })
    offsetX = 0;

    @property({ type: Number })
    offsetY = 0;

    @property({ type: Boolean })
    keepVisible: boolean = false;

    constructor()
    {
        super();
        this.onResize = this.onResize.bind(this);
    }

    protected connected()
    {
        this.calculatePosition();
        window.addEventListener("resize", this.onResize);
    }

    protected disconnected()
    {
        window.removeEventListener("resize", this.onResize)
    }

    protected firstUpdated()
    {
        this.style.position = "fixed";
        this.classList.add("ff-popup");
    }

    protected updated()
    {
        if (this.isConnected) {
            this.calculatePosition();
        }
    }

    protected calculatePosition()
    {
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

        let position;

        if (this.position === "center") {
            position = this.center(thisRect, portalRect);
        }
        else if (this.position === "anchor") {
            const anchor = this.anchor || this.parentElement;
            if (anchor) {
                anchorRect = anchor.getBoundingClientRect();
                position = this.positionToAnchor(thisRect, anchorRect, portalRect);
            }
        }
        else {
            position = { x: thisRect.left, y: thisRect.top };
        }

        if (this.keepVisible && this.position !== "center") {
            position = this.keepFloaterVisible(position, thisRect, portalRect);
        }

        this.style.left = Math.round(position.x) + "px";
        this.style.top = Math.round(position.y) + "px";
    }

    protected center(thisRect: ClientRect, portalRect: ClientRect)
    {
        return {
            x: Math.round((portalRect.width - thisRect.width) * 0.5),
            y: Math.round((portalRect.height - thisRect.height) * 0.5)
        };
    }

    protected positionToAnchor(thisRect: ClientRect, anchorRect: ClientRect, portalRect: ClientRect)
    {
        const align = this.align;
        const justify = this.justify;
        const offsetX = this.offsetX;
        const offsetY = this.offsetY;

        const position = { x: 0, y: 0 };

        switch(align) {
            case "start":
                position.x = justify !== "start" && justify !== "end"
                    ? anchorRect.left - thisRect.width - offsetX
                    : anchorRect.right - thisRect.width;
                break;
            case "end":
                position.x = justify !== "start" && justify !== "end"
                    ? anchorRect.right + offsetX
                    : anchorRect.left;
                break;
            default:
                position.x = anchorRect.left + (anchorRect.width - thisRect.width) * 0.5;
                break;
        }

        switch(justify) {
            case "start":
                position.y = align !== "start" && align !== "end"
                    ? anchorRect.top - thisRect.height - offsetY
                    : anchorRect.bottom - thisRect.height;
                break;
            case "end":
                position.y = align !== "start" && align !== "end"
                    ? anchorRect.bottom + offsetY
                    : anchorRect.top;
                break;
            default:
                position.y = anchorRect.top + (anchorRect.height - thisRect.height) * 0.5;
                break;
        }

        return position;
    }

    protected keepFloaterVisible(position: { x: number, y: number }, thisRect: ClientRect, portalRect: ClientRect)
    {
        const offsetX = this.offsetX;
        const offsetY = this.offsetY;

        if (thisRect.width > portalRect.width) {
            position.x = (portalRect.width - thisRect.width) * 0.5;
        }
        else if (position.x < portalRect.left + offsetX) {
            position.x = portalRect.left + offsetX;
        }
        else if (position.x + thisRect.width + offsetX > portalRect.right) {
            position.x = portalRect.right - thisRect.width - offsetX;
        }

        if (thisRect.height > portalRect.height) {
            position.y = (portalRect.height - thisRect.height) * 0.5;
        }
        else if (position.y < portalRect.top + offsetY) {
            position.y = portalRect.top + offsetY;
        }
        else if (position.y + thisRect.width + offsetY > portalRect.bottom) {
            position.y = portalRect.bottom - thisRect.height - offsetY;
        }

        return position;
    }

    protected onResize()
    {
        this.calculatePosition();
    }
}