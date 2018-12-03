/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property, html } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export interface ITreeNode
{
    id: string;
    children: ITreeNode[];
}

@customElement("ff-tree")
export default class Tree extends CustomElement
{
    constructor()
    {
        super();
    }

    protected renderNode(node: ITreeNode): HTMLElement
    {
        return new TreeNode(node);
    }

    protected render()
    {

    }

    protected getId(node): string
    {
        return node.id;
    }

    protected getClass(node): string
    {
        return "ff-node";
    }

    protected getChildren(node): []
    {
        return node.children;
    }
}

@customElement("ff-tree-node")
export class TreeNode extends CustomElement
{
    @property({ type: Boolean, reflect: true })
    expanded = false;

    @property({ type: Boolean, reflect: true })
    selected = false;

    readonly node: ITreeNode;

    protected headerElement: HTMLDivElement;

    constructor(node: ITreeNode)
    {
        super();

        this.node = node;
        this.headerElement = new HTMLDivElement();
    }

    protected firstUpdated()
    {
        const contentElement = new HTMLDivElement();
        contentElement.classList.add("ff-content");

        const headerElement = this.headerElement;
        headerElement.classList.add("ff-header");
        contentElement.appendChild(headerElement);

        const childrenElement = new HTMLDivElement();
        childrenElement.classList.add("ff-children");
        contentElement.appendChild(childrenElement);

        this.appendChild(contentElement);
    }

    protected createRenderRoot()
    {
        return this.headerElement;
    }

    render()
    {

    }
}