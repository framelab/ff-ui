/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Node from "@ff/graph/Node";
import Component from "@ff/graph/Component";
import Property from "@ff/graph/Property";
import PropertySet from "@ff/graph/PropertySet";

import SelectionController, { INodeEvent, IComponentEvent } from "@ff/graph/SelectionController";

import "./PropertyView";

import Tree, { customElement, property, html } from "../Tree";

////////////////////////////////////////////////////////////////////////////////

interface ITreeNode
{
    id: string;
    children: ITreeNode[];
    text: string;
    classes: string;
    property?: Property;
}

@customElement("ff-property-tree")
export default class PropertyTree extends Tree<ITreeNode>
{
    @property({ attribute: false })
    selectionController: SelectionController;

    constructor(selectionController?: SelectionController)
    {
        super();
        this.selectionController = selectionController;
        this.includeRoot = true;
    }

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("ff-property-tree");

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

        const node = controller.nodes.get();
        if (node) {
            this.root = this.createNodeTreeNode(node);
        }
        else {
            const component = controller.components.get();
            this.root = component ? this.createComponentTreeNode(component) : null;
        }
    }

    protected disconnected()
    {
        super.disconnected();

        this.selectionController.nodes.off<INodeEvent>("node", this.onSelectNode, this);
        this.selectionController.components.off<IComponentEvent>("component", this.onSelectComponent, this);
    }

    protected getClasses(node: ITreeNode)
    {
        return node.classes;
    }

    protected renderNodeHeader(node: ITreeNode)
    {
        return html`
            <div class="ff-text">${node.text}</div>
            ${node.property ? html`<ff-property-view .property=${node.property}></ff-property-view>` : null}
        `;
    }

    protected onSelectNode(event: INodeEvent)
    {
        if (event.add) {
            this.root = this.createNodeTreeNode(event.node);
        }
        else {
            this.root = null;
        }
    }

    protected onSelectComponent(event: IComponentEvent)
    {
        if (event.add) {
            this.root = this.createComponentTreeNode(event.component);
        }
        else {
            this.root = null;
        }
    }

    protected createNodeTreeNode(node: Node): ITreeNode
    {
        return {
            id: node.id,
            text: node.name || "Node",
            classes: "ff-node",
            children: node.components.getArray().map(component => this.createComponentTreeNode(component))
        };
    }

    protected createComponentTreeNode(component: Component): ITreeNode
    {
        const id = component.id;
        const inputsId = id + "i";
        const outputsId = id + "o";

        return {
            id,
            text: component.name || component.type,
            classes: "ff-component",
            property: null,
            children: [
                this.createSetNode(inputsId, "Inputs", component.ins),
                this.createSetNode(outputsId, "Outputs", component.outs)
            ]
        };
    }

    protected createSetNode(id: string, text: string, set: PropertySet): ITreeNode
    {
        const properties = set.properties;
        const root: ITreeNode = {
            id,
            text,
            classes: set.isInputSet() ? "ff-inputs" : "ff-outputs",
            children: []
        };

        properties.forEach(property => {
            const fragments = property.path.split(".");
            let node = root;

            const count = fragments.length;
            const last = count - 1;

            for (let i = 0; i < count; ++i) {
                const fragment = fragments[i];
                let child = node.children.find(node => node.text === fragment);

                if (!child) {
                    const id = i === last ? property.key : fragment;

                    child = {
                        id,
                        text: fragment,
                        classes: "",
                        children: [],
                        property: i === last ? property : null
                    };
                    node.children.push(child);
                }
                node = child;
            }
        });

        return root;
    }
}
