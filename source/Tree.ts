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


    constructor(root?: T)
    {
        super();
        this.root = root;
    }

    toggleSelected(node: T)
    {
        this.setSelected(node, undefined);
    }

    setSelected(node: T, state: boolean)
    {
        const id = this.idByNode.get(node);
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

    isSelected(node: T)
    {
        const id = this.idByNode.get(node);
        if (id) {
            const nodeElement = document.getElementById(id);
            return nodeElement.hasAttribute("selected");
        }

        return false;
    }

    toggleExpanded(node: T)
    {
        this.setExpanded(node, undefined);
    }

    setExpanded(node: T, state: boolean)
    {
        const id = this.idByNode.get(node);
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

    isExpanded(node: T)
    {
        const id = this.idByNode.get(node);
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

    protected update(changedProperties: PropertyValues): void
    {
        this.nodeById = {};
        this.idByNode.clear();

        super.update(changedProperties);
    }

    protected render()
    {
        const root = this.root;
        if (!root) {
            return;
        }

        if (this.includeRoot) {
            const id = this.getId(root);
            return this.renderNode(root, id);
        }
        else {
            return this.renderNodeChildren(root, this.getChildren(root));
        }
    }

    protected getId(node: T): string
    {
        return node.id || uniqueId();
    }

    protected getClasses(node: T): string
    {
        return null;
    }

    protected getChildren(node: T): any[] | null
    {
        return node.children || null;
    }

    protected isNodeSelected(node: T): boolean
    {
        return !!node.selected;
    }

    protected isNodeExpanded(node: T): boolean
    {
        return node.expanded !== undefined ? node.expanded : true;
    }

    protected renderNodeHeader(node: T): TemplateResult | string
    {
        return node.toString();
    }

    protected renderNodeContent(node: T, children: T[] | null): TemplateResult | string
    {
        return this.renderNodeChildren(node, children);
    }

    protected renderNodeChildren(node: T, children: T[] | null): TemplateResult
    {
        if (!children || children.length === 0) {
            return null;
        }

        let id;

        return html`
            ${repeat(children, child => (id = this.getId(child)), child => this.renderNode(child, id))}
        `;
    }

    protected renderNode(node: T, id: string): TemplateResult
    {
        this.nodeById[id] = node;
        this.idByNode.set(node, id);

        const children = this.getChildren(node);

        const selected = this.isNodeSelected(node);
        const expanded = this.isNodeExpanded(node);

        const typeClass = children && children.length > 0 ? "ff-inner " : "ff-leaf ";
        let classes = "ff-node " + typeClass + this.getClasses(node);

        const header = this.renderNodeHeader(node);
        const content = this.renderNodeContent(node, children);


        return html`
            <div class="ff-node-container">
                <div class=${classes} id=${id} ?selected=${selected} ?expanded=${expanded} @click=${this.onClick}>
                    <div class="ff-header">${header}</div>
                    <div class="ff-content">${content}</div>
                </div>
            </div>
        `;
    }

    protected onClick(event: MouseEvent)
    {
        const id = (event.currentTarget as Element).id;
        const node = this.nodeById[id];

        if (node) {
            this.onNodeClick(event, node, id);
        }
    }

    protected onNodeClick(event: MouseEvent, node: T, id: string)
    {
        this.toggleExpanded(node);
        event.stopPropagation();
    }
}
