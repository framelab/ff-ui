/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";
import CustomElement, { customElement, html, property } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export interface IPopupMenuSelectEvent extends CustomEvent
{
    detail: {
        index: number;
        option: string;
    }
}

@customElement("ff-popup-menu")
export default class PopupMenu extends CustomElement
{
    static readonly selectEvent = "ff-popup-menu-select";

    @property({ attribute: false })
    options: string[];

    @property({ type: Number })
    selectionIndex: number;

    constructor(options?: string[])
    {
        super();

        this.onClick = this.onClick.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);

        this.options = options || [];
        this.selectionIndex = -1;

        this.addEventListener("click", this.onClick);
        this.addEventListener("keydown", this.onKeyDown);
    }

    show(event: MouseEvent)
    {
        document.body.appendChild(this);

        setTimeout(() => {
            const left = math.limit(event.clientX - 5, 0, window.innerWidth - this.clientWidth) + "px";
            const top = math.limit(event.clientY - 5, 0, window.innerHeight - this.clientHeight) + "px";

            this.setStyle({
                left,
                top,
                opacity: "1",
                transition: "opacity 0.2s"
            });
        }, 0);
    }

    close()
    {
        this.style.opacity = "0";

        setTimeout(() => {
            this.remove();
        }, 200);
    }

    protected connected()
    {
        document.addEventListener("pointerdown", this.onPointerDown);
    }

    protected disconnected()
    {
        document.removeEventListener("pointerdown", this.onPointerDown);
    }

    protected render()
    {
        return html`
            ${this.options.map((option, index) => html`
                <button>${option}</button>
            `)}
        `;
    }

    protected updated()
    {
        const index = this.selectionIndex >= 0 ? this.selectionIndex : 0;
        const button = this.children.item(index) as HTMLButtonElement;
        if (button) {
            button.focus();
        }
    }

    protected firstUpdated()
    {
        this.classList.add("ff-menu", "ff-popup-menu");

        this.setStyle({
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            zIndex: "1000",
            opacity: "0",
        });
    }

    protected onClick(event: MouseEvent)
    {
        const children = this.getChildrenArray();
        const index = children.indexOf(event.target as Element);

        if (index >= 0 && index < this.options.length) {
            this.dispatchEvent(new CustomEvent(PopupMenu.selectEvent, { detail: {
                index,
                option: this.options[index]
            }}) as IPopupMenuSelectEvent);
        }

        this.close();
    }

    protected onPointerDown(event: PointerEvent)
    {
        if (event.target instanceof Node && this.contains(event.target)) {
            return;
        }

        this.close();
    }

    protected onKeyDown(event: KeyboardEvent)
    {
        if (event.key === "Escape") {
            this.close();
        }
    }
}