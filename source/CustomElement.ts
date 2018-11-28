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

@customElement
export default class CustomElement extends LitElement
{
    static readonly tagName: string = "ff-element";
    static readonly shady: boolean = false;

    static setStyle(element: HTMLElement, style: Partial<CSSStyleDeclaration>)
    {
        Object.assign(element.style, style);
    }

    setStyle(style: Partial<CSSStyleDeclaration>)
    {
        CustomElement.setStyle(this, style);
    }

    protected get shady()
    {
        return (this.constructor as typeof CustomElement).shady;
    }

    protected createRenderRoot()
    {
        return this.shady ? super.createRenderRoot() : this;
    }
}

export function customElement<T extends CustomElement>(constructor: TypeOf<T>)
{
    customElements.define((constructor as any).tagName, constructor);
    return constructor as any;
}
