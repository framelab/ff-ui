/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import uniqueId from "@ff/core/uniqueId";

import Component from "@ff/graph/Component";
import Node from "@ff/graph/Node";
import System from "@ff/graph/System";

import { IHierarchyEvent } from "@ff/graph/components/CHierarchy";
import CSelection, { INodeEvent, IComponentEvent } from "@ff/graph/components/CSelection";

import Tree, { customElement, html, property } from "../Tree";

////////////////////////////////////////////////////////////////////////////////

type NCS = Node | Component | System;

@customElement("ff-hierarchy-tree")
export default class HierarchyTree extends Tree<NCS>
{
    @property({ attribute: false })
    system: System;

    protected selection: CSelection = null;
    protected rootId = uniqueId();


    constructor(system?: System)
    {
        super(system);
        this.system = system;
    }

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("ff-hierarchy-tree");

        this.selection = this.system.components.safeGet(CSelection);
    }

    protected connected()
    {
        super.connected();

        const selection = this.selection;

        selection.selectedNodes.on<INodeEvent>("node", this.onSelectNode, this);
        selection.selectedComponents.on<IComponentEvent>("component", this.onSelectComponent, this);

        selection.system.nodes.on<INodeEvent>("node", this.onUpdate, this);
        selection.system.components.on<IComponentEvent>("component", this.onUpdate, this);
        selection.system.on<IHierarchyEvent>("hierarchy", this.onUpdate, this);
    }

    protected disconnected()
    {
        super.disconnected();

        const selection = this.selection;

        selection.selectedNodes.off<INodeEvent>("node", this.onSelectNode, this);
        selection.selectedComponents.off<IComponentEvent>("component", this.onSelectComponent, this);

        selection.system.nodes.off<INodeEvent>("node", this.onUpdate, this);
        selection.system.components.off<IComponentEvent>("component", this.onUpdate, this);
        selection.system.off<IHierarchyEvent>("hierarchy", this.onUpdate, this);
    }

    protected renderNodeHeader(treeNode: NCS)
    {
        let text;

        if (treeNode instanceof Component) {
            const name = treeNode.name;
            const type = treeNode.type.substr(1);
            text = name ? `${name} [${type}]` : type;
        }
        else if (treeNode instanceof Node) {
            const name = treeNode.name;
            const type = treeNode.type;
            if (type === "Node") {
                text = name ? name : type;
            }
            else {
                text = name ? `${name} [${type.substr(1)}]` : type.substr(1);
            }
        }
        else {
            text = "System";
        }

        return html`<div class="ff-text">${text}</div>`
    }

    protected isNodeSelected(treeNode: NCS)
    {
        const selection = this.selection;
        if (treeNode instanceof Component) {
            return selection.selectedComponents.contains(treeNode);
        }
        else if (treeNode instanceof Node) {
            return selection.selectedNodes.contains(treeNode);
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
            this.selection.selectNode(node, event.ctrlKey);
        }
        else if (node instanceof Component) {
            this.selection.selectComponent(node, event.ctrlKey);
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