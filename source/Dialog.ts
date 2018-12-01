/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property } from "./CustomElement";
import { PropertyValues } from "@polymer/lit-element";

////////////////////////////////////////////////////////////////////////////////

export type DialogMode = "default" | "popup" | "modal";

/**
 * Dialog container element.
 */
@customElement("ff-dialog")
export default class Dialog extends CustomElement
{
    @property({ type: String, reflect: true })
    mode: DialogMode = "default";

    @property({ type: Boolean, reflect: true })
    center = false;

    @property({ type: Boolean })
    anchor = false;

    protected modalPlane: ModalPlane;

    constructor()
    {
        super();

        this.onResize = this.onResize.bind(this);

        this.modalPlane = null;
    }

    close()
    {
    }

    show()
    {
        if (this.mode === "modal") {
            if (!this.modalPlane) {
                this.modalPlane = new ModalPlane();
            }

            this.modalPlane.appendChild(this);
            document.body.appendChild(this.modalPlane);
        }
        else {
            document.body.appendChild(this);
        }
    }

    protected onInitialConnect()
    {
        this.setStyle({
            position: "absolute",
            display: "flex",
            boxSizing: "border-box",
            flexDirection: "column",
            overflow: "hidden"
        });
    }

    protected onConnect()
    {
        window.addEventListener("resize", this.onResize);

        if (this.center) {
            setTimeout(() => this.moveToCenter(), 0);
        }
    }

    protected onDisconnect()
    {
        window.removeEventListener("resize", this.onResize);
    }

    protected onResize()
    {
    }

    protected moveToCenter()
    {
        const thisRect = this.getBoundingClientRect();
        const parentRect = this.parentElement.getBoundingClientRect();
        this.style.left = `${(parentRect.width - thisRect.width) * 0.5}px`;
        this.style.top = `${(parentRect.height - thisRect.height) * 0.5}px`;
    }
}

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-modal-plane")
export class ModalPlane extends CustomElement
{
    @property({ type: Boolean })
    closable = false;

    constructor()
    {
        super();

        this.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    }

    protected onInitialConnect()
    {
        this.setStyle({
            position: "absolute",
            top: "0",
            bottom: "0",
            left: "0",
            right: "0"
        });
    }

    protected update(changedProperties: PropertyValues): void
    {
        super.update(changedProperties);

        if (changedProperties.has("closable")) {
            this.style.cursor = this.closable ? "default" : "not-allowed";
            this.style.opacity = this.closable ? "1.0" : "0.0";
        }
    }

    protected onPointerDown(event: PointerEvent)
    {
        if (!this.closable) {
            return;
        }

        this.parentElement.removeChild(this);

        // re-dispatch event to element under modal plane
        const element = document.elementFromPoint(event.clientX, event.clientY);
        if (element) {
            const eventType: any = event.constructor;
            const newEvent = new eventType(event.type, event);
            element.dispatchEvent(newEvent);
        }
    }
}
