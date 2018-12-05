/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { TypeOf, Partial, Dictionary } from "@ff/core/types";
import { LitElement as LitElementBase, html, property, PropertyValues } from "@polymer/lit-element";

////////////////////////////////////////////////////////////////////////////////

export { html, property, PropertyValues };

export default class LitElement extends LitElementBase
{
    static readonly tagName: string;
    static readonly shady: boolean = false;

    static setStyle(element: HTMLElement, style: Partial<CSSStyleDeclaration>)
    {
        Object.assign(element.style, style);
    }

    static setAttribs(element: HTMLElement, attribs: Dictionary<string>)
    {
        for (let name in attribs) {
            element.setAttribute(name, attribs[name]);
        }
    }

    private _isFirstConnected = false;


    setStyle(style: Partial<CSSStyleDeclaration>): this
    {
        LitElement.setStyle(this, style);
        return this;
    }

    setAttribs(attribs: Dictionary<string>): this
    {
        LitElement.setAttribs(this, attribs);
        return this;
    }

    appendTo(parent: Element): this
    {
        parent.appendChild(this);
        return this;
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

    appendElement<T extends HTMLElement>(
        type: TypeOf<T>, style?: Partial<CSSStyleDeclaration>): T;

    appendElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K, style?: Partial<CSSStyleDeclaration>): HTMLElementTagNameMap[K];

    appendElement(tagOrType, style)
    {
        return this.createElement(tagOrType, style, this);
    }

    createElement<T extends HTMLElement>(
        type: TypeOf<T>, style?: Partial<CSSStyleDeclaration>, parent?: Element): T;

    createElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K, style?: Partial<CSSStyleDeclaration>, parent?: Element): HTMLElementTagNameMap[K];

    createElement(tagOrType, style, parent)
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

    connectedCallback()
    {
        super.connectedCallback();

        if (!this._isFirstConnected) {
            this._isFirstConnected = true;
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
        return (this.constructor as typeof LitElement).shady;
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

export function customElement<T extends LitElement>(tagName?: string)
{
    return <T extends LitElement>(constructor: TypeOf<T>) => {
        (constructor as any).tagName = tagName;
        customElements.define((constructor as any).tagName, constructor);
        return constructor as any;
    }
}
