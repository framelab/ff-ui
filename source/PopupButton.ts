/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Button from "./Button";
import Popup from "./Popup";
import { customElement, html, PropertyValues } from "./LitElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-popup-button")
export default class PopupButton extends Button
{
    protected popupElement: HTMLElement;
    protected isPopupVisible = false;

    constructor()
    {
        super();

        this.popupElement = this.createElement("div", {
            position: "relative"
        });

        this.addEventListener(Popup.closeEvent, () => this.selected = false);
    }

    protected firstConnected()
    {
        this.popupElement.classList.add("ff-content");
        this.getChildrenArray().forEach(child => this.popupElement.appendChild(child));
    }

    protected update(changedProperties: PropertyValues)
    {
        const style = this.popupElement.style;

        if (changedProperties.has("selected") && this.selected) {
            style.opacity = "1";
            this.isPopupVisible = true;
        }

        super.update(changedProperties);

        if (changedProperties.has("selected") && !this.selected) {
            style.opacity = "0";
            this.isPopupVisible = false;
            const duration = parseFloat(style.transitionDuration) || 0;
            setTimeout(() => this.requestUpdate(), duration * 1000);
        }
    }

    protected render()
    {
        if (this.isPopupVisible) {
            const button = super.render();
            return html`${button}${this.popupElement}`;
        }

        return super.render();
    }

    protected firstUpdated()
    {
        super.firstUpdated();

        this.classList.add("ff-popup-button");
    }
}