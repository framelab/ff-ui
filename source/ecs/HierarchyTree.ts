/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import uniqueId from "@ff/core/uniqueId";
import { Entity, Component, Hierarchy, System } from "@ff/core/ecs";

import SelectionController, {
    ISelectComponentEvent,
    ISelectEntityEvent
} from "@ff/core/ecs/SelectionController";

import Tree from "../Tree";
import { customElement, html } from "../CustomElement";

////////////////////////////////////////////////////////////////////////////////

type ECS = Entity | Component | System;

@customElement("ff-hierarchy-tree")
export default class HierarchyTree extends Tree<ECS>
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

        this.controller.on("entity", this.onSelectEntity, this);
        this.controller.on("component", this.onSelectComponent, this);
    }

    protected disconnected()
    {
        super.disconnected();

        this.controller.off("entity", this.onSelectEntity, this);
        this.controller.off("component", this.onSelectComponent, this);
    }

    protected renderNodeHeader(node: ECS)
    {
        let text;

        if (node instanceof Entity) {
            text = node.name || "Entity";
        }
        else if (node instanceof Component) {
            text = node.name || node.type;
        }
        else {
            text = "System";
        }

        return html`<div class="ff-text">${text}</div>`
    }

    protected getId(node: ECS)
    {
        return node instanceof System ? this.rootId : node.id;
    }

    protected getClasses(node: ECS)
    {
        if (node instanceof Entity) {
            return "ff-entity";
        }
        if (node instanceof Component) {
            return "ff-component";
        }

        return "ff-system";
    }

    protected getChildren(node: ECS)
    {
        if (node instanceof Entity) {
            return node.components.getArray();
        }
        if (node instanceof Hierarchy) {
            return node.children.map(child => child.entity);
        }
        if (node instanceof System) {
            return node.module.entities.findRoots();
        }

        return null;
    }

    protected onNodeClick(event: MouseEvent, node: ECS, id: string)
    {
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

        if (event.clientX - rect.left < 30) {
            this.toggleExpanded(node);
        }
        else if (node instanceof Entity) {
            this.controller.selectEntity(node, event.ctrlKey);
        }
        else if (node instanceof Component) {
            this.controller.selectComponent(node, event.ctrlKey);
        }

        event.stopPropagation();
    }

    protected onSelectEntity(event: ISelectEntityEvent)
    {
        this.setSelected(event.entity, event.selected);
    }

    protected onSelectComponent(event: ISelectComponentEvent)
    {
        this.setSelected(event.component, event.selected);
    }
}