/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import "./Splitter";
import "./Icon";

import CustomElement, { customElement, property, html, TemplateResult } from "./CustomElement";

////////////////////////////////////////////////////////////////////////////////

export type RenderHeaderFunction<T> = (column: ITableColumn<T>, clickHandler: (event: MouseEvent, column: ITableColumn<T>) => void) => TemplateResult;
export type RenderCellFunction<T> = (row: T) => string | TemplateResult;
export type SortFunction<T> = (row0: T, row1: T) => number;

export interface ITableColumn<T>
{
    header: string | RenderHeaderFunction<T>;
    cell?: string | RenderCellFunction<T>;
    sortable?: boolean | SortFunction<T>;
    resizable?: boolean;
    width?: number | string;
    className?: string;
}

export interface ITableRowSelectEvent<T> extends CustomEvent
{
    target: Table<T>;
    detail: {
        row: T;
        selected: boolean;
    };
}

@customElement("ff-table")
export default class Table<T> extends CustomElement
{
    @property({ attribute: false })
    rows: T[] = null;

    @property({ attribute: false })
    selectedRows = new Set<T>();

    @property({ attribute: false })
    columns: ITableColumn<T>[] = null;

    @property({ type: String })
    placeholder = "";

    @property({ type: Boolean })
    resizable = false;

    @property({ type: Boolean })
    selectable = false;

    @property({ type: Boolean })
    multiselect = false;

    constructor()
    {
        super();
        this.onClickHeader = this.onClickHeader.bind(this);
    }

    protected firstConnected()
    {
        super.firstConnected();
        this.classList.add("ff-table");
    }

    protected renderHeader(column: ITableColumn<T>): TemplateResult
    {
        const header = column.header;
        const defaultWidth = 1 / this.columns.length;
        const width = typeof column.width === "string" ? column.width : ((column.width || defaultWidth) * 100 + "%");
        const sortIcon = column.sortable ? html`<ff-icon name="sort"></ff-icon>` : null;
        const classes = column.className || "";

        if (typeof header === "string") {
            return html`<th class="ff-table-header ${classes}" style="width: ${width}" @click=${e => this.onClickHeader(e, column)}>${header}${sortIcon}</th>`;
        }

        return header(column, this.onClickHeader);
    }

    protected renderRow(row: T, index: number): TemplateResult
    {
        const columns = this.columns;
        const selected = this.selectedRows.has(row);

        return html`<tr ?selected=${selected} @click=${e => this.onClickRow(e, row)}>${columns.map(column =>
                this.renderCell(row, column, index, selected))}</tr>`;
    }

    protected renderCell(row: T, column: ITableColumn<T>, index: number, selected: boolean): TemplateResult
    {
        const cell = column.cell;
        const classes = column.className || "";

        if (typeof cell === "string") {
            return html`<td class="ff-table-cell ${classes}">${row[cell]}</td>`;
        }

        const result = cell(row);
        if (typeof result === "string") {
            return html`<td class="ff-table-cell ${classes}">${result}</td>`;
        }

        return result;
    }

    protected render()
    {
        const rows = this.rows;
        const selectedRows = this.selectedRows;

        const columns = this.columns;

        if (!rows || !columns) {
            this.selectedRows.clear();
            return html`<div class="ff-placeholder"><div class="ff-text">${this.placeholder}</div></div>`;
        }

        // update set of selected rows from new array of rows
        if (selectedRows.size > 0) {
            const _selectedRows = new Set<T>();
            rows.forEach(row => {
                if (selectedRows.has(row)) {
                    _selectedRows.add(row);
                }
            });

            this.selectedRows.clear();
            this.selectedRows = _selectedRows;
        }

        return html`<table><thead><tr>${columns.map(column => this.renderHeader(column))}</tr></thead>
            <tbody>${rows.map((row, index) => this.renderRow(row, index))}</tbody></table>`;
    }

    protected onClickHeader(event: MouseEvent, column: ITableColumn<T>)
    {
        console.log("Table.onClickHeader", column.header);
    }

    protected onClickRow(event: MouseEvent, row: T)
    {
        if (this.selectable) {
            const selectedRows = this.selectedRows;

            const selected = selectedRows.has(row);
            if (event.ctrlKey && this.multiselect) {
                if (selected) {
                    selectedRows.delete(row);
                    this.emitRowSelectEvent(row, false);
                }
                else {
                    selectedRows.add(row);
                    this.emitRowSelectEvent(row, true);
                }
                this.performUpdate();
            }
            else if (!selected) {
                selectedRows.forEach(row => this.emitRowSelectEvent(row, false));
                selectedRows.clear();
                selectedRows.add(row);
                this.performUpdate();
            }
        }
    }

    protected emitRowSelectEvent(row: T, selected: boolean)
    {
        this.dispatchEvent(new CustomEvent("select", {
            detail: { row, selected }
        }));
    }
}
