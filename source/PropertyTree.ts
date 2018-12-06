/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("ff-property-tree")
export default class PropertyTree extends CustomElement
{

}

@customElement("ff-property-tree-node")
export class PropertyTreeNode extends CustomElement
{

}