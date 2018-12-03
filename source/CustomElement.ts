/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { TypeOf, Partial } from "@ff/core/types";
import { LitElement, html, property, PropertyValues } from "@polymer/lit-element";

////////////////////////////////////////////////////////////////////////////////

export { html, property, PropertyValues };

export default class CustomElement extends LitElement
{
    static readonly tagName: string;
    static readonly shady: boolean = false;

    static setStyle(element: HTMLElement, style: Partial<CSSStyleDeclaration>)
    {
        Object.assign(element.style, style);
    }

    private isFirstConnected = false;


    setStyle(style: Partial<CSSStyleDeclaration>)
    {
        CustomElement.setStyle(this, style);
    }

    createElement<T extends CustomElement>(
        type: TypeOf<T>, style?: Partial<CSSStyleDeclaration>, parent?: Element): T;

    createElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K, style?: Partial<CSSStyleDeclaration>, parent?: Element): HTMLElementTagNameMap[K];

    createElement(tagOrType, style?: Partial<CSSStyleDeclaration>, parent?: Element)
    {
        let element;

        if (typeof tagOrType === "string") {
            element = document.createElement(tagOrType);
        }
        else {
            element = new tagOrType();
        }

        if (style) {
            Object.assign(element.style, style);
        }
        if (parent) {
            parent.appendChild(element);
        }

        return element;
    }

    removeChildren()
    {
        while(this.firstChild) {
            this.removeChild(this.firstChild);
        }
    }

    getChildrenArray()
    {
        return Array.from(this.children);
    }

    connectedCallback()
    {
        super.connectedCallback();

        if (!this.isFirstConnected) {
            this.isFirstConnected = true;
            this.firstConnected();
        }

        this.connected();
    }

    disconnectedCallback()
    {
        super.disconnectedCallback();
        this.disconnected();
    }

    protected get shady()
    {
        return (this.constructor as typeof CustomElement).shady;
    }

    protected createRenderRoot()
    {
        return this.shady ? super.createRenderRoot() : this;
    }

    protected firstConnected()
    {
    }

    protected connected()
    {
    }

    protected disconnected()
    {
    }
}

export function customElement<T extends CustomElement>(tagName?: string)
{
    return <T extends CustomElement>(constructor: TypeOf<T>) => {
        (constructor as any).tagName = tagName;
        customElements.define((constructor as any).tagName, constructor);
        return constructor as any;
    }
}
