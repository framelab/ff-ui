/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { Dictionary } from "@ff/core/types";
import uniqueId from "@ff/core/uniqueId";

import CustomElement, {
    customElement,
    property,
    PropertyValues,
    html,
    TemplateResult,
    repeat
} from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

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

    protected nodeById: Dictionary<T> = {};
    protected idByNode: Map<T, string> = new Map();
    protected treeId = uniqueId(4);

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
        const id = this.idByNode.get(treeNode);
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
        const id = this.idByNode.get(treeNode);
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
        const id = this.idByNode.get(treeNode);
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
        const id = this.idByNode.get(treeNode);
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
        this.nodeById = {};
        this.idByNode.clear();

        const root = this.root;
        if (!root) {
            return html``;
        }

        if (this.includeRoot) {
            const id = this.getId(root) + this.treeId;
            return this.renderNode(root, id);
        }
        else {
            return this.renderNodeChildren(root, this.getChildren(root));
        }
    }

    protected getId(treeNode: T): string
    {
        return treeNode.id || uniqueId();
    }

    protected getClasses(treeNode: T): string
    {
        return null;
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

    protected renderNodeContent(treeNode: T, children: T[] | null): TemplateResult | string
    {
        return this.renderNodeChildren(treeNode, children);
    }

    protected renderNodeChildren(treeNode: T, children: T[] | null): TemplateResult
    {
        if (!children || children.length === 0) {
            return null;
        }

        let id;

        return html`
            ${repeat(children, child => (
                id = this.getId(child) + this.treeId), child => this.renderNode(child, id))}
        `;
    }

    protected renderNode(treeNode: T, id: string): TemplateResult
    {
        this.nodeById[id] = treeNode;
        this.idByNode.set(treeNode, id);

        const children = this.getChildren(treeNode);

        const selected = this.isNodeSelected(treeNode);
        const expanded = this.isNodeExpanded(treeNode);

        const typeClass = children && children.length > 0 ? "ff-inner " : "ff-leaf ";
        let classes = "ff-tree-node " + typeClass + this.getClasses(treeNode);

        const header = this.renderNodeHeader(treeNode);
        const content = this.renderNodeContent(treeNode, children);


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
        const treeNode = this.nodeById[id];

        if (treeNode) {
            this.onNodeClick(event, treeNode, id);
        }

        event.stopPropagation();
    }

    protected onNodeClick(event: MouseEvent, treeNode: T, id: string)
    {
        this.toggleExpanded(treeNode);
    }
}
