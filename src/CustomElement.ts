/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { TypeOf, Dictionary } from "@ff/core/types";
import { LitElement } from "lit-element";

////////////////////////////////////////////////////////////////////////////////

export { property, query, queryAll, css, PropertyValues } from "lit-element";
export { html, svg, render, TemplateResult } from "lit-html";
export { repeat } from "lit-html/directives/repeat";

@customElement("ff-custom-element")
export default class CustomElement extends LitElement
{
    public static readonly tagName: string = "ff-custom-element";

    protected static readonly shady: boolean = false;
    protected static readonly classes: string | string[] = "";

    /** 
     * Sets the given styles at the given element.
     */
    static setStyle(element: HTMLElement, style: Partial<CSSStyleDeclaration>)
    {
        Object.assign(element.style, style);
    }

    /**
     * Sets the given attributes at the given element.
     */
    static setAttribs(element: HTMLElement, attribs: Dictionary<string>)
    {
        for (const name in attribs) {
            element.setAttribute(name, attribs[name]);
        }
    }

    private _isFirstConnected = false;

    
    constructor()
    {
        super();
        // note: attributes haven't yet been set in constructor

        const classes = (this.constructor as typeof CustomElement).classes;
        if (Array.isArray(classes)) {
            classes.forEach(c => this.addClass(c));
        }
        else if (classes) {
            this.addClass(classes);
        }
    }

    /**
     * Returns true if this element is using shadow DOM.
     */
    get shady()
    {
        return (this.constructor as typeof CustomElement).shady;
    }

    /**
     * Appends this element to the given parent.
     */
    appendTo(parent: Element): this
    {
        parent.appendChild(this);
        return this;
    }

    /**
     * Removes all child elements.
     */
    removeChildren()
    {
        while(this.firstChild) {
            this.removeChild(this.firstChild);
        }
    }

    /**
     * Returns an array with all child elements.
     */
    getChildrenArray()
    {
        return Array.from(this.children);
    }

    appendElement<T extends HTMLElement>(
        type: TypeOf<T> | T, style?: Partial<CSSStyleDeclaration>): T;

    appendElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K, style?: Partial<CSSStyleDeclaration>): HTMLElementTagNameMap[K];

    appendElement(tagOrType, style)
    {
        return this.createElement(tagOrType, style, this);
    }

    createElement<T extends HTMLElement>(
        type: TypeOf<T> | T, style?: Partial<CSSStyleDeclaration>, parent?: Element): T;

    createElement<K extends keyof HTMLElementTagNameMap>(
        tagName: K, style?: Partial<CSSStyleDeclaration>, parent?: Element): HTMLElementTagNameMap[K];

    createElement(tagOrType, style, parent)
    {
        let element;

        if (typeof tagOrType === "string") {
            element = document.createElement(tagOrType);
        }
        else if (tagOrType instanceof HTMLElement) {
            element = tagOrType;
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

    setStyle(style: Partial<CSSStyleDeclaration>): this
    {
        CustomElement.setStyle(this, style);
        return this;
    }

    setAttribute(name: string, value: string)
    {
        super.setAttribute(name, value);
        return this;
    }

    setAttributes(attribs: Dictionary<string>): this
    {
        CustomElement.setAttribs(this, attribs);
        return this;
    }

    addClass(...classes: string[]): this
    {
        classes.forEach(klass => this.classList.add(klass));
        return this;
    }

    removeClass(...classes: string[]): this
    {
        classes.forEach(klass => this.classList.remove(klass));
        return this;
    }

    setClass(name: string, state: boolean): this
    {
        if (state) {
            this.classList.add(name);
        }
        else {
            this.classList.remove(name);
        }

        return this;
    }

    /**
     * Returns true if this element is the focused element of the document.
     */
    hasFocus()
    {
        return document.activeElement === this;
    }

    /**
     * Attaches an event listener to this element.
     * This is a convenience method for 'addEventListener'.
     */
    on<T extends Event>(type: string, listener: (event: T) => any, options?: boolean | AddEventListenerOptions)
    {
        this.addEventListener(type, listener, options);
        return this;
    }

    /**
     * Removes an event listener from this element.
     * This is a convenience alias for 'removeEventListener'.
     */
    off<T extends Event>(type: string, listener: (event: T) => any, options?: boolean | AddEventListenerOptions)
    {
        this.removeEventListener(type, listener, options);
        return this;
    }

    /**
     * Dispatches a custom event of the given type.
     * The detail information is available on the event as 'event.detail'.
     */
    emit<T extends CustomEvent = CustomEvent>(type: string, detail: T["detail"])
    {
        this.dispatchEvent(new CustomEvent(type, { detail }));
    }

    connectedCallback()
    {
        if (!this._isFirstConnected) {
            this._isFirstConnected = true;
            this.firstConnected();
        }

        this.connected();
        super.connectedCallback();
    }

    disconnectedCallback()
    {
        super.disconnectedCallback();
        this.disconnected();
    }

    protected createRenderRoot()
    {
        return this.shady ? super.createRenderRoot() : this;
    }

    /**
     * Called after the element has been added to the document
     * for the first time.
     * No need to call super from this method.
     */
    protected firstConnected(): void
    {
        return;
    }

    /**
     * Called after the element has been added to the document.
     * No need to call super from this method.
     */
    protected connected(): void
    {
        return;
    }

    /**
     * Called after the element has been removed from the document.
     * No need to cal super from this method.
     */
    protected disconnected(): void
    {
        return;
    }

    /** Use this member as call target when subscribing to events which require
     * an update. Calls `LitElement.requestUpdate()`, disregarding any arguments.
     */
    protected onUpdate()
    {
        this.requestUpdate();
    }
}

/**
 * Decorator defining the tag name for a custom element.
 * @param tagName The tag name under which this element is registered.
 */
export function customElement<T extends CustomElement>(tagName?: string)
{
    return (constructor: TypeOf<T>) => {
        (constructor as any).tagName = tagName;
        customElements.define((constructor as any).tagName, constructor);
        return constructor as any;
    }
}
