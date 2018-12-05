/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Floater from "./Floater";
import { customElement, property } from "./LitElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-popup")
export default class Popup extends Floater
{
    @property({ type: Boolean })
    closable = false;

    static readonly closeEvent = "ff-close";

    protected plane: HTMLElement;
    protected closingRequested = false;

    constructor()
    {
        super();

        this.onPointerDown = this.onPointerDown.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    close()
    {
        if (!this.closable || this.closingRequested) {
            return;
        }

        this.closingRequested = true;
        this.dispatchEvent(new CustomEvent(Popup.closeEvent, { bubbles: true }));
    }

    protected connected()
    {
        document.addEventListener("pointerdown", this.onPointerDown);
        document.addEventListener("keydown", this.onKeyDown);
    }

    protected disconnected()
    {
        this.closingRequested = false;
        document.removeEventListener("pointerdown", this.onPointerDown);
        document.removeEventListener("keydown", this.onKeyDown);
    }

    protected onPointerDown(event: PointerEvent)
    {
        if (event.target instanceof Node && !this.contains(event.target)) {
            this.close();
        }
    }

    protected onKeyDown(event: KeyboardEvent)
    {
        if (event.key === "Escape") {
            this.close();
        }
    }
}