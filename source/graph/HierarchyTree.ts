/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import uniqueId from "@ff/core/uniqueId";

import Node from "@ff/graph/Node";
import Component from "@ff/graph/Component";
import Hierarchy from "@ff/graph/Hierarchy";
import System from "@ff/graph/System";

import SelectionController, {
    ISelectComponentEvent,
    ISelectNodeEvent
} from "@ff/graph/SelectionController";

import Tree from "../Tree";
import { customElement, html, property } from "../CustomElement";

////////////////////////////////////////////////////////////////////////////////

type NCS = Node | Component | System;

@customElement("ff-hierarchy-tree")
export default class HierarchyTree extends Tree<NCS>
{
    @property({ attribute: false })
    controller: SelectionController;

    protected rootId = uniqueId();

    constructor(controller: SelectionController)
    {
        super(controller.system);
        this.controller = controller;
    }

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("ff-hierarchy-tree");

        if (!this.controller) {
            throw new Error("missing controller");
        }
    }

    protected connected()
    {
        super.connected();

        this.controller.on("select-node", this.onSelectNode, this);
        this.controller.on("select-component", this.onSelectComponent, this);
        this.controller.on("update", this.onUpdate, this);
        this.controller.system.on("hierarchy", this.onUpdate, this);
    }

    protected disconnected()
    {
        super.disconnected();

        this.controller.off("select-node", this.onSelectNode, this);
        this.controller.off("select-component", this.onSelectComponent, this);
        this.controller.off("update", this.onUpdate, this);
        this.controller.system.off("hierarchy", this.onUpdate, this);
    }

    protected renderNodeHeader(treeNode: NCS)
    {
        let text;

        if (treeNode instanceof Node) {
            text = treeNode.name || "Node";
        }
        else if (treeNode instanceof Component) {
            text = treeNode.name || treeNode.type;
        }
        else {
            text = "System";
        }

        return html`<div class="ff-text">${text}</div>`
    }

    protected isNodeSelected(treeNode: NCS)
    {
        const controller = this.controller;
        if (treeNode instanceof Component) {
            return controller.isComponentSelected(treeNode);
        }
        else if (treeNode instanceof Node) {
            return controller.isNodeSelected(treeNode);
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

    protected onNodeClick(event: MouseEvent, node: NCS, id: string)
    {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

        if (event.clientX - rect.left < 30) {
            this.toggleExpanded(node);
        }
        else if (node instanceof Node) {
            this.controller.selectNode(node, event.ctrlKey);
        }
        else if (node instanceof Component) {
            this.controller.selectComponent(node, event.ctrlKey);
        }
    }

    protected onSelectNode(event: ISelectNodeEvent)
    {
        this.setSelected(event.node, event.selected);
    }

    protected onSelectComponent(event: ISelectComponentEvent)
    {
        this.setSelected(event.component, event.selected);
    }

    protected onUpdate()
    {
        this.requestUpdate();
    }
}