/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import math from "@ff/core/math";

import {
    Property,
    types
} from "@ff/graph";

import PopupOptions, { IPopupMenuSelectEvent } from "../PopupOptions";
import CustomElement, { customElement, property, PropertyValues } from "../CustomElement";

////////////////////////////////////////////////////////////////////////////////

export { Property };

@customElement("ff-property-field")
export default class PropertyField extends CustomElement
{
    static readonly defaultPrecision = 3;
    static readonly defaultStep = 0.1;

    @property({ attribute: false })
    property: Property;

    @property({ attribute: false })
    index: number = undefined;

    protected value: any = undefined;
    protected isActive: boolean = false;
    protected isDragging: boolean = false;
    protected startX: number = 0;
    protected startY: number = 0;
    protected lastX: number = 0;
    protected lastY: number = 0;
    protected editElement: HTMLInputElement = null;
    protected barElement: HTMLDivElement = null;
    protected contentElement: HTMLDivElement;

    constructor(property?: Property)
    {
        super();

        this.onFocus = this.onFocus.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
        this.onSelectOption = this.onSelectOption.bind(this);

        this.addEventListener("focus", this.onFocus);
        this.addEventListener("click", this.onClick);
        this.addEventListener("pointerdown", this.onPointerDown);
        this.addEventListener("pointermove", this.onPointerMove);
        this.addEventListener("pointerup", this.onPointerUp);
        this.addEventListener("pointercancel", this.onPointerUp);

        this.property = property;
    }

    protected update(changedProperties: PropertyValues)
    {
        // remove child elements
        if (this.contentElement) {
            this.contentElement.remove();
            if (this.barElement) {
                this.barElement.remove();
            }
        }

        const property = this.property;
        const schema = property.schema;

        // create content element
        this.contentElement = this.appendElement("div", {
            position: "absolute", top: "0", bottom: "0", left: "0", right: "0",
            userSelect: "none", pointerEvents: "none"
        });
        this.contentElement.classList.add("ff-content");

        const classList = this.classList;
        const isInput = property.isInput();
        if (isInput) {
            classList.add("ff-input");
            classList.remove("ff-output");
        }
        else {
            classList.add("ff-output");
            classList.remove("ff-input");
        }

        const isLinked = isInput ? property.hasInLinks(this.index) : property.hasOutLinks(this.index);
        isLinked ? classList.add("ff-linked") : classList.remove("ff-linked");
        schema.event ? classList.add("ff-event") : classList.remove("ff-event");
        schema.options ? classList.add("ff-option") : classList.remove("ff-option");

        // create bar element
        const { min, max, bar } = schema;
        if (!schema.options && min !== undefined && max !== undefined && bar !== undefined) {
            this.barElement = this.appendElement("div", {
                position: "absolute", top: "0", bottom: "0", left: "0"
            });

            this.barElement.classList.add("ff-bar");
        }

        this.updateElement();
    }

    protected firstConnected()
    {
        this.tabIndex = 0;

        this.setStyle({
            position: "relative",
            overflow: "hidden"
        });

        this.classList.add("ff-property-field");

        if (!this.property) {
            throw new Error("missing property");
        }
    }

    protected connected()
    {
        this.property.on("value", this.onPropertyValue, this);
        this.property.on("update", this.onPropertyUpdate, this);
    }

    protected disconnected()
    {
        this.property.off("value", this.onPropertyValue, this);
        this.property.off("update", this.onPropertyUpdate, this);
    }

    protected onFocus(event: FocusEvent)
    {
    }

    protected onClick(event: MouseEvent)
    {
        if (this.isDragging) {
            return;
        }

        const property = this.property;
        const schema = property.schema;

        if (schema.options) {
            const popup = new PopupOptions();
            popup.options = schema.options;
            popup.selectionIndex = types.getOptionIndex(schema.options, property.value);
            popup.position = "anchor";
            popup.anchor = this;
            popup.align = "fixed";
            popup.justify = "end";
            popup.positionX = event.clientX - 10;
            popup.keepVisible = true;
            popup.addEventListener(PopupOptions.selectEvent, this.onSelectOption);
            document.body.appendChild(popup);
            return;
        }

        switch(property.type) {
            case "number":
            case "string":
                this.startEditing();
                break;

            case "boolean":
                this.updateProperty(!this.value);
                break;
        }
    }

    protected onPointerDown(event: PointerEvent)
    {
        if (!event.isPrimary) {
            return;
        }

        this.isDragging = false;

        const property = this.property;
        if (property.type !== "number" || property.schema.options) {
            return;
        }

        this.isActive = true;
        this.startX = event.clientX;
        this.startY = event.clientY;
    }

    protected onPointerMove(event: PointerEvent)
    {
        if (!event.isPrimary || !this.isActive) {
            return;
        }

        if (!this.isDragging) {
            const dx = event.clientX - this.startX;
            const dy = event.clientY - this.startY;
            const delta = Math.abs(dx) + Math.abs(dy);
            if (delta > 2) {
                this.setPointerCapture(event.pointerId);
                this.isDragging = true;
                console.log(delta, "dragging true");
            }
        }

        if (this.isDragging) {
            const dx = event.clientX - this.lastX;
            const dy = event.clientY - this.lastY;
            const delta = dx - dy;

            const property = this.property;
            const schema = property.schema;
            let step = PropertyField.defaultStep;
            if (schema.step) {
                step = schema.step;
            }
            else if (schema.min !== undefined && schema.max !== undefined) {
                step = (schema.max - schema.min) / this.clientWidth;
            }

            step = event.ctrlKey ? step * 0.1 : step;
            step = event.shiftKey ? step * 10 : step;
            let value = this.value + delta * step;
            value = schema.min !== undefined ? Math.max(value, schema.min) : value;
            value = schema.max !== undefined ? Math.min(value, schema.max) : value;

            this.updateProperty(value);

            event.stopPropagation();
            event.preventDefault();
        }

        this.lastX = event.clientX;
        this.lastY = event.clientY;
    }

    protected onPointerUp(event: PointerEvent)
    {
        if (this.isActive && event.isPrimary) {
            this.isActive = false;

            if (this.isDragging) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    }

    protected startEditing()
    {
        const property = this.property;
        let text = this.value;
        if (property.type === "number") {
            text = this.value.toFixed(5);
        }

        const editElement = this.editElement = document.createElement("input");
        this.appendChild(editElement);
        editElement.setAttribute("type", "text");
        editElement.value = text;
        editElement.focus();
        editElement.select();

        editElement.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                this.stopEditing(false);
            }
            else if (e.key === "Enter") {
                this.stopEditing(true);
            }
        });

        editElement.addEventListener("blur", () => {
            this.stopEditing(true);
        });

        PropertyField.setStyle(editElement, {
            position: "absolute", zIndex: "1", boxSizing: "border-box", width: "100%", height: "100%"
        });
    }

    protected stopEditing(commit: boolean)
    {
        if (this.editElement) {
            const editElement = this.editElement;
            this.editElement = null;
            this.removeChild(editElement);

            const property = this.property;
            const schema = property.schema;

            let value: any = editElement.value;
            if (this.property.type === "number") {
                value = parseFloat(value) || 0;
                value = schema.min !== undefined ? Math.max(value, schema.min) : value;
                value = schema.max !== undefined ? Math.min(value, schema.max) : value;
            }

            this.updateProperty(value);
        }
    }

    protected onSelectOption(event: IPopupMenuSelectEvent)
    {
        const index = event.detail.index;
        this.updateProperty(index);
    }

    protected onPropertyValue()
    {
        this.updateElement();
    }

    protected onPropertyUpdate()
    {
        this.updateElement();
    }

    protected updateElement()
    {
        const property = this.property;
        const schema = property.schema;
        let value: any = property.value;
        let text = "";

        if (this.index >= 0) {
            value = value[this.index];
        }

        this.value = value;

        switch(property.type) {
            case "number":
                if (schema.options) {
                    text = types.getOptionValue(schema.options, value);
                }
                else {
                    const precision = schema.precision !== undefined
                        ? schema.precision : PropertyField.defaultPrecision;

                    text = value.toFixed(precision);

                    if (this.barElement) {
                        this.barElement.style.width
                            = math.scaleLimit(value, schema.min, schema.max, 0, 100) + "%";
                    }
                }
                break;

            case "boolean":
                text = value ? "true" : "false";
                break;

            case "string":
                text = value;
                break;

            case "object":
                text = value.toString();
                break;
        }

        this.contentElement.innerText = text;
    }

    protected updateProperty(value: any)
    {
        const property = this.property;
        if (this.index >= 0) {
            property.value[this.index] = value;
            property.set();
        }
        else {
            property.setValue(value);
        }
    }
}