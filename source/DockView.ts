/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import LitElement, { customElement } from "./LitElement";
import DockStrip, { IDockElementLayout } from "./DockStrip";
import DockStack from "./DockStack";
import DockPanel from "./DockPanel";

////////////////////////////////////////////////////////////////////////////////

export type DockContentRegistry = Map<string, () => HTMLElement>;

@customElement("ff-dock-view")
export default class DockView extends LitElement
{
    static readonly changeEvent: string = "ff-dock-view-change";

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
        // remove all children
        while(this.firstChild) {
            this.removeChild(this.firstChild);
        }

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

    protected firstConnected()
    {
        this.setStyle({
            display: "flex",
            alignItems: "stretch"
        });
    }
}