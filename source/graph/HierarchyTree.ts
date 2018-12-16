/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import uniqueId from "@ff/core/uniqueId";
import { Node, Component, Hierarchy, System } from "@ff/graph";

import SelectionController, {
    ISelectComponentEvent,
    ISelectNodeEvent
} from "@ff/graph/SelectionController";

import Tree from "../Tree";
import { customElement, html } from "../CustomElement";

////////////////////////////////////////////////////////////////////////////////

type NCS = Node | Component | System;

@customElement("ff-hierarchy-tree")
export default class HierarchyTree extends Tree<NCS>
{
    protected controller: SelectionController;
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
    }

    protected connected()
    {
        super.connected();

        this.controller.on("node", this.onSelectNode, this);
        this.controller.on("component", this.onSelectComponent, this);
    }

    protected disconnected()
    {
        super.disconnected();

        this.controller.off("node", this.onSelectNode, this);
        this.controller.off("component", this.onSelectComponent, this);
    }

    protected renderNodeHeader(node: NCS)
    {
        let text;

        if (node instanceof Node) {
            text = node.name || "Node";
        }
        else if (node instanceof Component) {
            text = node.name || node.type;
        }
        else {
            text = "System";
        }

        return html`<div class="ff-text">${text}</div>`
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
            return node.components.getArray();
        }
        if (node instanceof Hierarchy) {
            return node.children.map(child => child.node);
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
}