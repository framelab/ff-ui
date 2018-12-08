/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Button from "./Button";
import Popup from "./Popup";
import { customElement, property, PropertyValues } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-popup-button")
export default class PopupButton extends Button
{
    @property({ attribute: false })
    content: HTMLElement = null;

    @property({ attribute: false })
    contentParent: HTMLElement = this;

    @property({ type: Boolean })
    transient = false;

    constructor()
    {
        super();
        this.addEventListener(Popup.closeEvent, () => this.selected = false);

        this.onPointerDown = this.onPointerDown.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    protected connected()
    {
        document.addEventListener("pointerdown", this.onPointerDown, { capture: true, passive: true });
        document.addEventListener("keydown", this.onKeyDown, { capture: true, passive: true });

    }

    protected disconnected()
    {
        document.removeEventListener("pointerdown", this.onPointerDown);
        document.removeEventListener("keydown", this.onKeyDown);

    }

    protected update(changedProperties: PropertyValues)
    {
        super.update(changedProperties);

        const contentElement = this.content;

        if (contentElement && changedProperties.has("selected")) {
            const parentElement = this.contentParent || this;

            if (this.selected) {
                parentElement.appendChild(contentElement);
                setTimeout(() => contentElement.style.opacity = "1.0", 0);
            }
            else if (contentElement.parentElement === parentElement) {
                this.focus();
                contentElement.style.opacity = "0";
                const duration = parseFloat(window.getComputedStyle(contentElement).transitionDuration) || 0;
                setTimeout(() => parentElement.removeChild(contentElement), duration * 1000);
            }
        }
    }

    protected onPointerDown(event: PointerEvent)
    {
        if (event.target instanceof Node && !this.contains(event.target)) {
            this.selected = false;
        }
    }

    protected onKeyDown(event: KeyboardEvent)
    {
        if (event.key === "Escape") {
            this.selected = false;
        }
    }
}