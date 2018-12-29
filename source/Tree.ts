/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { Dictionary } from "@ff/core/types";
import uniqueId from "@ff/core/uniqueId";

import CustomElement, { customElement, property, html, TemplateResult, repeat } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export { customElement, property, html, TemplateResult };

export interface ITreeNode
{
    id: string;
    children: ITreeNode[];
}

@customElement("ff-tree")
export default class Tree<T extends any = any> extends CustomElement
{
    @property({ attribute: false })
    root: T = null;

    @property({ type: Boolean })
    includeRoot = false;

    private _nodeById: Dictionary<T> = {};
    private _idByNode: Map<T, string> = new Map();
    private _containerId = uniqueId(4);

    constructor(root?: T)
    {
        super();
        this.root = root;
    }

    toggleSelected(treeNode: T)
    {
        this.setSelected(treeNode, undefined);
    }

    setSelected(treeNode: T, state: boolean)
    {
        const id = this._idByNode.get(treeNode);
        if (id) {
            const nodeElement = document.getElementById(id);
            if (state === undefined) {
                state = !nodeElement.hasAttribute("selected");
            }

            if (state) {
                nodeElement.setAttribute("selected", "");
            }
            else {
                nodeElement.removeAttribute("selected");
            }
        }
    }

    isSelected(treeNode: T)
    {
        const id = this._idByNode.get(treeNode);
        if (id) {
            const nodeElement = document.getElementById(id);
            return nodeElement.hasAttribute("selected");
        }

        return false;
    }

    toggleExpanded(treeNode: T)
    {
        this.setExpanded(treeNode, undefined);
    }

    setExpanded(treeNode: T, state: boolean)
    {
        const id = this._idByNode.get(treeNode);
        if (id) {
            const nodeElement = document.getElementById(id);
            if (state === undefined) {
                state = !nodeElement.hasAttribute("expanded");
            }

            if (state) {
                nodeElement.setAttribute("expanded", "");
            }
            else {
                nodeElement.removeAttribute("expanded");
            }
        }
    }

    isExpanded(treeNode: T)
    {
        const id = this._idByNode.get(treeNode);
        if (id) {
            const nodeElement = document.getElementById(id);
            return nodeElement.hasAttribute("expanded");
        }

        return false;
    }

    protected firstConnected()
    {
        this.classList.add("ff-tree");
    }

    protected render()
    {
        this._nodeById = {};
        this._idByNode.clear();

        const root = this.root;
        if (!root) {
            return html``;
        }

        if (this.includeRoot) {
            const id = this.getId(root) + this._containerId;
            return this.renderNode(root, id, 0);
        }
        else {
            return this.renderNodeChildren(root, this.getChildren(root), 0);
        }
    }

    protected getId(treeNode: T): string
    {
        return treeNode.id || uniqueId();
    }

    protected getClasses(treeNode: T): string
    {
        return "";
    }

    protected getChildren(treeNode: T): any[] | null
    {
        return treeNode.children || null;
    }

    protected isNodeSelected(treeNode: T): boolean
    {
        return !!treeNode.selected;
    }

    protected isNodeExpanded(treeNode: T): boolean
    {
        return treeNode.expanded !== undefined ? treeNode.expanded : true;
    }

    protected renderNodeHeader(treeNode: T): TemplateResult | string
    {
        return treeNode.toString();
    }

    protected renderNodeContent(treeNode: T, children: T[] | null, level: number): TemplateResult | string
    {
        return this.renderNodeChildren(treeNode, children, level);
    }

    protected renderNodeChildren(treeNode: T, children: T[] | null, level: number): TemplateResult
    {
        if (!children || children.length === 0) {
            return null;
        }

        let id;

        return html`
            ${repeat(children, child => (
                id = this.getId(child) + this._containerId), child => this.renderNode(child, id, level))}
        `;
    }

    protected renderNode(treeNode: T, id: string, level: number): TemplateResult
    {
        this._nodeById[id] = treeNode;
        this._idByNode.set(treeNode, id);

        const children = this.getChildren(treeNode);

        const selected = this.isNodeSelected(treeNode);
        const expanded = this.isNodeExpanded(treeNode);

        const typeClass = children && children.length > 0 ? "ff-inner " : "ff-leaf ";
        const levelClass = level % 2 === 0 ? "ff-even " : "ff-odd ";
        let classes = "ff-tree-node " + typeClass + levelClass + this.getClasses(treeNode);

        const header = this.renderNodeHeader(treeNode);
        const content = this.renderNodeContent(treeNode, children, level + 1);


        return html`
            <div class="ff-tree-node-container">
                <div class=${classes} id=${id} ?selected=${selected} ?expanded=${expanded}>
                    <div class="ff-header" @click=${this.onClick}>${header}</div>
                    <div class="ff-content">${content}</div>
                </div>
            </div>
        `;
    }

    protected onClick(event: MouseEvent)
    {
        const headerElement = event.currentTarget as HTMLDivElement;
        const id = headerElement.parentElement.id; // node element
        const treeNode = this._nodeById[id];

        if (treeNode) {
            this.onClickNode(event, treeNode);
        }

        event.stopPropagation();
    }

    protected onClickNode(event: MouseEvent, treeNode: T)
    {
        this.toggleExpanded(treeNode);
    }
}
