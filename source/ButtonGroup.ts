/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CustomElement, { customElement, property } from "./CustomElement";
import Button from "./Button";

////////////////////////////////////////////////////////////////////////////////

export type ButtonGroupMode = "exclusive" | "radio";

@customElement("ff-button-group")
export default class ButtonGroup extends CustomElement
{
    @property({ type: String })
    mode: ButtonGroupMode = "radio";

    @property({ type: Number })
    selectionIndex = -1;

    protected observer = new MutationObserver(this.onObserver);
    protected selectedButton: Button = null;

    constructor()
    {
        super();

        this.addEventListener("click", (e) => this.onClick(e));

    }

    protected onConnect()
    {
        this.observer.observe(this, { childList: true });
    }

    protected onDisconnect()
    {
        this.observer.disconnect();
    }

    protected onInitialConnect()
    {
        const buttons = Array.from(this.getElementsByTagName(Button.tagName)) as Button[];
        if (this.selectionIndex < 0 || this.selectionIndex >= buttons.length) {
            if (this.mode === "radio") {
                this.selectionIndex = 0;
            }
            else {
                return;
            }
        }

        this.selectedButton = buttons[this.selectionIndex];
        this.selectedButton.selected = true;
    }

    protected onObserver(mutations)
    {
        mutations.forEach(mutation => {
            if (mutation.type === "childList") {
                // TODO
            }
        });
    }

    protected onClick(event: MouseEvent)
    {
        let target = event.target as HTMLElement;
        while(target && target !== this && !(target instanceof Button)) {
            target = target.parentElement;
        }

        if (!(target instanceof Button)) {
            return;
        }

        if (target.selected) {
            if (this.mode === "exclusive") {
                target.selected = false;
                this.selectedButton = null;
                this.selectionIndex = -1;
            }
        }
        else {
            if (this.selectedButton) {
                this.selectedButton.selected = false;
            }

            this.selectedButton = target;
            this.selectedButton.selected = true;
            this.selectionIndex = this.getIndexFromButton(target);
        }
    }

    protected getIndexFromButton(button: Button)
    {
        const buttons = Array.from(this.getElementsByTagName(Button.tagName));
        for (let i = 0, n = buttons.length; i < n; ++i) {
            if (button === buttons[i]) {
                return i;
            }
        }

        return -1;
    }
}