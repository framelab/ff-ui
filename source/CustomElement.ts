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

    private _initialConnect: boolean;

    constructor()
    {
        super();
        this._initialConnect = false;
    }

    setStyle(style: Partial<CSSStyleDeclaration>)
    {
        CustomElement.setStyle(this, style);
    }

    connectedCallback()
    {
        super.connectedCallback();

        if (!this._initialConnect) {
            this._initialConnect = true;
            this.onInitialConnect();
        }

        this.onConnect();
    }

    disconnectedCallback()
    {
        super.disconnectedCallback();
        this.onDisconnect();
    }

    protected get shady()
    {
        return (this.constructor as typeof CustomElement).shady;
    }

    protected createRenderRoot()
    {
        return this.shady ? super.createRenderRoot() : this;
    }

    protected onInitialConnect()
    {
    }

    protected onConnect()
    {
    }

    protected onDisconnect()
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
