/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { LitElement } from "@polymer/lit-element";

import DockStrip, { IDockElementLayout } from "./DockStrip";
import DockStack from "./DockStack";
import DockPanel from "./DockPanel";

////////////////////////////////////////////////////////////////////////////////

export type DockContentRegistry = Map<string, () => HTMLElement>;

export default class DockView extends LitElement
{
    static readonly tagName: string = "ff-dock-view";

    constructor()
    {
        super();

        const style = this.style;
        style.display = "flex";
        style.alignItems = "stretch";
    }

    setPanelsMovable(state: boolean)
    {
        const elements = this.getElementsByTagName(DockPanel.tagName);
        for (let element of elements) {
            (element as DockPanel).movable = state;
        }
    }

    setPanelsClosable(state: boolean)
    {
        const elements = this.getElementsByTagName(DockPanel.tagName);
        for (let element of elements) {
            (element as DockPanel).closable = state;
        }
    }

    setLayout(layout: IDockElementLayout, registry: DockContentRegistry)
    {
        let element;

        switch(layout.type) {
            case "strip":
                element = new DockStrip();
                break;
            case "stack":
                element = new DockStack();
                break;
       }

       element.setLayout(layout, registry);
       this.appendChild(element);
    }

    getLayout(): IDockElementLayout | null
    {
        const element = this.firstChild;
        if (element && (element instanceof DockStrip || element instanceof DockStack)) {
            return element.getLayout() as any;
        }

        return null;
    }

    protected createRenderRoot()
    {
        return this;
    }
}

customElements.define(DockView.tagName, DockView);
