/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import uniqueId from "@ff/core/uniqueId";

import Node from "@ff/graph/Node";
import Component from "@ff/graph/Component";

import System from "@ff/graph/System";
import { IHierarchyEvent } from "@ff/graph/Hierarchy";

import SelectionController, { INodeEvent, IComponentEvent } from "@ff/graph/SelectionController";

import Tree, { customElement, html, property } from "../Tree";

////////////////////////////////////////////////////////////////////////////////

type NCS = Node | Component | System;

@customElement("ff-hierarchy-tree")
export default class HierarchyTree extends Tree<NCS>
{
    @property({ attribute: false })
    selectionController: SelectionController;

    protected rootId = uniqueId();

    constructor(selectionController: SelectionController)
    {
        super(selectionController.system);
        this.selectionController = selectionController;
    }

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("ff-hierarchy-tree");

        if (!this.selectionController) {
            throw new Error("missing selection controller");
        }
    }

    protected connected()
    {
        super.connected();

        const controller = this.selectionController;

        controller.nodes.on<INodeEvent>("node", this.onSelectNode, this);
        controller.components.on<IComponentEvent>("component", this.onSelectComponent, this);

        controller.system.nodes.on<INodeEvent>("node", this.onUpdate, this);
        controller.system.components.on<IComponentEvent>("component", this.onUpdate, this);
        controller.system.on<IHierarchyEvent>("hierarchy", this.onUpdate, this);
    }

    protected disconnected()
    {
        super.disconnected();

        const controller = this.selectionController;

        controller.nodes.off<INodeEvent>("node", this.onSelectNode, this);
        controller.components.off<IComponentEvent>("component", this.onSelectComponent, this);

        controller.system.nodes.off<INodeEvent>("node", this.onUpdate, this);
        controller.system.components.off<IComponentEvent>("component", this.onUpdate, this);
        controller.system.off<IHierarchyEvent>("hierarchy", this.onUpdate, this);
    }

    protected renderNodeHeader(treeNode: NCS)
    {
        let text;

        if (treeNode instanceof Component) {
            const name = treeNode.name;
            text = name ? `${name} [${treeNode.type}]` : treeNode.type;
        }
        else if (treeNode instanceof Node) {
            const name = treeNode.name;
            const type = treeNode.type;
            text = name ? (type !== "Node" ? `${name} [${type}]` : name) : treeNode.type;
        }
        else {
            text = "System";
        }

        return html`<div class="ff-text">${text}</div>`
    }

    protected isNodeSelected(treeNode: NCS)
    {
        const selection = this.selectionController;
        if (treeNode instanceof Component) {
            return selection.components.contains(treeNode);
        }
        else if (treeNode instanceof Node) {
            return selection.nodes.contains(treeNode);
        }
    }

    protected getId(node: NCS)
    {
        return node instanceof System ? this.rootId : node.id;
    }

    protected getClasses(node: NCS)
    {
        if (node instanceof Node) {
            return "ff-node";
        }
        if (node instanceof Component) {
            return "ff-component";
        }

        return "ff-system";
    }

    protected getChildren(node: NCS)
    {
        if (node instanceof Node) {
            let children: any = node.components.getArray();
            const hierarchy = node.hierarchy;
            if (hierarchy) {
                children = children.concat(hierarchy.children.map(child => child.node));
            }
            return children;
        }
        if (node instanceof System) {
            return node.graph.nodes.findRoots();
        }

        return null;
    }

    protected onClickNode(event: MouseEvent, node: NCS)
    {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

        if (event.clientX - rect.left < 30) {
            this.toggleExpanded(node);
        }
        else if (node instanceof Node) {
            this.selectionController.selectNode(node, event.ctrlKey);
        }
        else if (node instanceof Component) {
            this.selectionController.selectComponent(node, event.ctrlKey);
        }
    }

    protected onSelectNode(event: INodeEvent)
    {
        this.setSelected(event.node, event.add);
    }

    protected onSelectComponent(event: IComponentEvent)
    {
        this.setSelected(event.component, event.add);
    }

    protected onUpdate()
    {
        this.requestUpdate();
    }
}