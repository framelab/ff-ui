/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import uniqueId from "@ff/core/uniqueId";
import CustomElement, { customElement, property, html, repeat, TemplateResult } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export { customElement, property, html, TemplateResult };

@customElement("ff-list")
export default class List<T extends any = any> extends CustomElement
{
    @property({ attribute: false })
    data: T[] = null;

    private _itemById: Map<string, T>;
    private _idByItem: Map<T, string>;
    private _containerId: string;

    constructor(data?: T[])
    {
        super();
        this.data = data;

        this._itemById = new Map();
        this._idByItem = new Map();
        this._containerId = uniqueId(4);

        this.onClickEmpty = this.onClickEmpty.bind(this);
        this.addEventListener("click", this.onClickEmpty);
    }

    setSelected(item: T, state: boolean)
    {
        const id = this._idByItem.get(item);
        if (id) {
            const element = document.getElementById(id);
            if (state === undefined) {
                state = !element.hasAttribute("selected");
            }

            if (state) {
                element.setAttribute("selected", "");
            }
            else {
                element.removeAttribute("selected");
            }
        }
    }

    toggleSelected(item: T)
    {
        this.setSelected(item, undefined);
    }

    isSelected(item: T): boolean
    {
        const id = this._idByItem.get(item);
        if (id) {
            const element = document.getElementById(id);
            return element.hasAttribute("selected");
        }

        return false;
    }

    protected firstConnected()
    {
        this.setStyle({
            display: "flex",
            flexDirection: "column"
        });

        this.classList.add("ff-list");
    }

    protected render()
    {
        this._itemById.clear();
        this._idByItem.clear();

        const items = this.data;
        if (!items) {
            return null;
        }

        let id;

        return html`${repeat(items, item => (id = this.getId(item) + this._containerId),
            item => {
                this._itemById.set(id, item);
                this._idByItem.set(item, id);
                
                const selected = this.isItemSelected(item);
                const expanded = this.isItemExpanded(item);
                const classes = "ff-list-item " + this.getClass(item);
                
                return html`<div class=${classes} id=${id} ?selected=${selected} ?expanded=${expanded} @click=${this.onClick}>
                    ${this.renderItem(item)}
                </div>`;
            }
        )}`;
    }

    protected renderItem(item: T): TemplateResult | string
    {
        return String(item);
    }

    protected getId(item: T): string
    {
        return item.id || uniqueId();
    }

    protected getClass(item: T): string
    {
        return "";
    }

    protected isItemSelected(item: T): boolean
    {
        return item.selected !== undefined ? item.selected : false;
    }

    protected isItemExpanded(item: T): boolean
    {
        return item.expanded !== undefined ? item.expanded : true;
    }

    protected onClick(event: MouseEvent)
    {
        const element = event.currentTarget as HTMLDivElement;
        const item = this._itemById.get(element.id);

        if (item) {
            const index = this.data.indexOf(item);
            this.onClickItem(event, item, index);
        }

        event.stopPropagation();
    }

    protected onClickItem(event: MouseEvent, item: T, index: number)
    {
    }

    protected onClickEmpty(event: MouseEvent)
    {
    }
}