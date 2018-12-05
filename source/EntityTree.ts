/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import System from "@ff/core/ecs/System";
import Entity from "@ff/core/ecs/Entity";
import LitElement, { customElement, property } from "./LitElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-entity-tree")
export default class EntityTree extends LitElement
{

}

@customElement("ff-entity-tree-node")
export class EntityTreeNode extends LitElement
{

}