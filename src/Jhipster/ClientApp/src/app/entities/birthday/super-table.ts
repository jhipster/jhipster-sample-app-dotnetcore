/* eslint-disable */ 

import { NgModule, Component, HostListener, OnInit, OnDestroy, AfterViewInit, Directive, Optional, AfterContentInit,
    Input, ElementRef, NgZone, ChangeDetectorRef, OnChanges, ChangeDetectionStrategy, ViewEncapsulation, Renderer2} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule, PrimeNGConfig, FilterService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DomHandler } from 'primeng/dom';
import { Injectable } from '@angular/core';
import { BlockableUI } from 'primeng/api';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {trigger,style,transition,animate} from '@angular/animations';
import { Table } from 'primeng/table'
import { TableService } from 'primeng/table';
import { TableBody } from 'primeng/table';
import { ColumnFilter } from 'primeng/table';
import { ScrollableView } from 'primeng/table';
import { SelectableRow } from 'primeng/table';
import { ReorderableRow } from 'primeng/table';
import { ColumnFilterFormElement } from 'primeng/table';
import { SortIcon } from 'primeng/table';
import { SortableColumn } from 'primeng/table';
import { EditableColumn } from 'primeng/table';
import { CellEditor } from 'primeng/table';
import { ContextMenuRow } from 'primeng/table';
import { RowToggler } from 'primeng/table';
import { ResizableColumn } from 'primeng/table';
import { ReorderableColumn } from 'primeng/table';
import { TableRadioButton } from 'primeng/table';
import { TableCheckbox } from 'primeng/table';
import { TableHeaderCheckbox } from 'primeng/table';
import { TableState } from 'primeng/api';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Injectable()

@Component({
    selector: 'super-table',
    template: `
        <div #container [ngStyle]="style" [class]="styleClass" data-scrollselectors=".p-datatable-scrollable-body, .p-datatable-unfrozen-view .p-datatable-scrollable-body"
            [ngClass]="{'p-datatable p-component': true,
                'p-datatable-hoverable-rows': (rowHover||selectionMode),
                'p-datatable-auto-layout': autoLayout,
                'p-datatable-resizable': resizableColumns,
                'p-datatable-resizable-fit': (resizableColumns && columnResizeMode === 'fit'),
                'p-datatable-scrollable': scrollable,
                'p-datatable-flex-scrollable': (scrollable && scrollHeight === 'flex'),
                'p-datatable-responsive': responsive}">
            <div class="p-datatable-loading-overlay p-component-overlay" *ngIf="loading && showLoader">
                <i [class]="'p-datatable-loading-icon pi-spin ' + loadingIcon"></i>
            </div>
            <div *ngIf="captionTemplate" class="p-datatable-header">
                <ng-container *ngTemplateOutlet="captionTemplate"></ng-container>
            </div>
            <p-paginator [rows]="rows" [first]="first" [totalRecords]="totalRecords" [pageLinkSize]="pageLinks" styleClass="p-paginator-top" [alwaysShow]="alwaysShowPaginator"
                (onPageChange)="onPageChange($event)" [rowsPerPageOptions]="rowsPerPageOptions" *ngIf="paginator && (paginatorPosition === 'top' || paginatorPosition =='both')"
                [templateLeft]="paginatorLeftTemplate" [templateRight]="paginatorRightTemplate" [dropdownAppendTo]="paginatorDropdownAppendTo" [dropdownScrollHeight]="paginatorDropdownScrollHeight"
                [currentPageReportTemplate]="currentPageReportTemplate" [showFirstLastIcon]="showFirstLastIcon" [dropdownItemTemplate]="paginatorDropdownItemTemplate" [showCurrentPageReport]="showCurrentPageReport" [showJumpToPageDropdown]="showJumpToPageDropdown" [showPageLinks]="showPageLinks"></p-paginator>

            <div class="p-datatable-wrapper" *ngIf="!scrollable">
                <table role="grid" #table [ngClass]="tableStyleClass" [ngStyle]="tableStyle">
                    <ng-container *ngTemplateOutlet="colGroupTemplate; context {$implicit: columns}"></ng-container>
                    <thead class="p-datatable-thead">
                        <ng-container *ngTemplateOutlet="headerTemplate; context: {$implicit: columns}"></ng-container>
                    </thead>
                    <tbody class="p-datatable-tbody" [super-table-body]="columns" [pTableBodyTemplate]="bodyTemplate"></tbody>
                    <tfoot *ngIf="footerTemplate" class="p-datatable-tfoot">
                        <ng-container *ngTemplateOutlet="footerTemplate; context {$implicit: columns}"></ng-container>
                    </tfoot>
                </table>
            </div>

            <div class="p-datatable-scrollable-wrapper" *ngIf="scrollable">
               <div class="p-datatable-scrollable-view p-datatable-frozen-view" *ngIf="frozenColumns||frozenBodyTemplate" #scrollableFrozenView [super-scrollable-view]="frozenColumns" [frozen]="true" [ngStyle]="{width: frozenWidth}" [scrollHeight]="scrollHeight"></div>
               <div class="p-datatable-scrollable-view" #scrollableView [super-scrollable-view]="columns" [frozen]="false" [scrollHeight]="scrollHeight" [ngStyle]="{left: frozenWidth, width: 'calc(100% - '+frozenWidth+')'}"></div>
            </div>

            <p-paginator [rows]="rows" [first]="first" [totalRecords]="totalRecords" [pageLinkSize]="pageLinks" styleClass="p-paginator-bottom" [alwaysShow]="alwaysShowPaginator"
                (onPageChange)="onPageChange($event)" [rowsPerPageOptions]="rowsPerPageOptions" *ngIf="paginator && (paginatorPosition === 'bottom' || paginatorPosition =='both')"
                [templateLeft]="paginatorLeftTemplate" [templateRight]="paginatorRightTemplate" [dropdownAppendTo]="paginatorDropdownAppendTo" [dropdownScrollHeight]="paginatorDropdownScrollHeight"
                [currentPageReportTemplate]="currentPageReportTemplate" [showFirstLastIcon]="showFirstLastIcon" [dropdownItemTemplate]="paginatorDropdownItemTemplate" [showCurrentPageReport]="showCurrentPageReport" [showJumpToPageDropdown]="showJumpToPageDropdown" [showPageLinks]="showPageLinks"></p-paginator>

            <div *ngIf="summaryTemplate" class="p-datatable-footer">
                <ng-container *ngTemplateOutlet="summaryTemplate"></ng-container>
            </div>

            <div #resizeHelper class="p-column-resizer-helper" style="display:none" *ngIf="resizableColumns"></div>
            <span #reorderIndicatorUp class="pi pi-arrow-down p-datatable-reorder-indicator-up" style="display:none" *ngIf="reorderableColumns"></span>
            <span #reorderIndicatorDown class="pi pi-arrow-up p-datatable-reorder-indicator-down" style="display:none" *ngIf="reorderableColumns"></span>
        </div>
    `,
    providers: [TableService],
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None,
    styles: [`
    .p-datatable {
        position: relative;
    }
    
    .p-datatable table {
        border-collapse: collapse;
        min-width: 100%;
        table-layout: fixed;
    }
    
    .p-datatable .p-sortable-column {
        cursor: pointer;
        user-select: none;
    }
    
    .p-datatable .p-sortable-column .p-column-title,
    .p-datatable .p-sortable-column .p-sortable-column-icon,
    .p-datatable .p-sortable-column .p-sortable-column-badge {
        vertical-align: middle;
    }
    
    .p-datatable .p-sortable-column .p-sortable-column-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    
    .p-datatable-auto-layout > .p-datatable-wrapper {
        overflow-x: auto;
    }
    
    .p-datatable-auto-layout > .p-datatable-wrapper > table {
        table-layout: auto;
    }
    
    .p-datatable-responsive-scroll > .p-datatable-wrapper {
        overflow-x: auto;
    }
    
    .p-datatable-responsive-scroll > .p-datatable-wrapper > table,
    .p-datatable-auto-layout > .p-datatable-wrapper > table {
        table-layout: auto;
    }
    
    .p-datatable-hoverable-rows .p-selectable-row {
        cursor: pointer;
    }
    
    /* Scrollable */
    .p-datatable-scrollable .p-datatable-wrapper {
        position: relative;
        overflow: auto;
    }
    
    .p-datatable-scrollable .p-datatable-thead,
    .p-datatable-scrollable .p-datatable-tbody,
    .p-datatable-scrollable .p-datatable-tfoot {
        display: block;
    }
    
    .p-datatable-scrollable .p-datatable-thead > tr,
    .p-datatable-scrollable .p-datatable-tbody > tr,
    .p-datatable-scrollable .p-datatable-tfoot > tr {
        display: flex;
        flex-wrap: nowrap;
        width: 100%;
    }
    
    .p-datatable-scrollable .p-datatable-thead > tr > th,
    .p-datatable-scrollable .p-datatable-tbody > tr > td,
    .p-datatable-scrollable .p-datatable-tfoot > tr > td {
        display: flex;
        flex: 1 1 0;
        align-items: center;
    }
    
    .p-datatable-scrollable .p-datatable-thead {
        position: sticky;
        top: 0;
        z-index: 1;
    }
    
    .p-datatable-scrollable .p-datatable-frozen-tbody {
        position: sticky;
        z-index: 1;
    }
    
    .p-datatable-scrollable .p-datatable-tfoot {
        position: sticky;
        bottom: 0;
        z-index: 1;
    }
    
    .p-datatable-scrollable .p-frozen-column {
        position: sticky;
        background: inherit;
    }
    
    .p-datatable-scrollable th.p-frozen-column {
        z-index: 1;
    }
    
    .p-datatable-scrollable-both .p-datatable-thead > tr > th,
    .p-datatable-scrollable-both .p-datatable-tbody > tr > td,
    .p-datatable-scrollable-both .p-datatable-tfoot > tr > td,
    .p-datatable-scrollable-horizontal .p-datatable-thead > tr > th
    .p-datatable-scrollable-horizontal .p-datatable-tbody > tr > td,
    .p-datatable-scrollable-horizontal .p-datatable-tfoot > tr > td {
        flex: 0 0 auto;
    }
    
    .p-datatable-flex-scrollable {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    
    .p-datatable-flex-scrollable .p-datatable-wrapper {
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 100%;
    }
    
    .p-datatable-scrollable .p-rowgroup-header {
        position: sticky;
        z-index: 1;
    }
    
    .p-datatable-scrollable.p-datatable-grouped-header .p-datatable-thead,
    .p-datatable-scrollable.p-datatable-grouped-footer .p-datatable-tfoot {
        display: table;
        border-collapse: collapse;
        width: 100%;
        table-layout: fixed;
    }
    
    .p-datatable-scrollable.p-datatable-grouped-header .p-datatable-thead > tr,
    .p-datatable-scrollable.p-datatable-grouped-footer .p-datatable-tfoot > tr {
        display: table-row;
    }
    
    .p-datatable-scrollable.p-datatable-grouped-header .p-datatable-thead > tr > th,
    .p-datatable-scrollable.p-datatable-grouped-footer .p-datatable-tfoot > tr > td {
        display: table-cell;
    }
    
    /* Flex Scrollable */
    .p-datatable-flex-scrollable {
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 100%;
    }
    
    .p-datatable-flex-scrollable .p-datatable-virtual-scrollable-body {
        flex: 1;
    }
    
    /* Resizable */
    .p-datatable-resizable > .p-datatable-wrapper {
        overflow-x: auto;
    }
    
    .p-datatable-resizable .p-datatable-thead > tr > th,
    .p-datatable-resizable .p-datatable-tfoot > tr > td,
    .p-datatable-resizable .p-datatable-tbody > tr > td {
        overflow: hidden;
        white-space: nowrap;
    }
    
    .p-datatable-resizable .p-resizable-column {
        background-clip: padding-box;
        position: relative;
    }
    
    .p-datatable-resizable-fit .p-resizable-column:last-child .p-column-resizer {
        display: none;
    }
    
    .p-datatable .p-column-resizer {
        display: block;
        position: absolute !important;
        top: 0;
        right: 0;
        margin: 0;
        width: .5rem;
        height: 100%;
        padding: 0px;
        cursor:col-resize;
        border: 1px solid transparent;
    }
    
    .p-datatable .p-column-resizer-helper {
        width: 1px;
        position: absolute;
        z-index: 10;
        display: none;
    }
    
    .p-datatable .p-row-editor-init,
    .p-datatable .p-row-editor-save,
    .p-datatable .p-row-editor-cancel {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
    }
    
    /* Expand */
    .p-datatable .p-row-toggler {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
    }
    
    /* Reorder */
    .p-datatable-reorder-indicator-up,
    .p-datatable-reorder-indicator-down {
        position: absolute;
        display: none;
    }
    
    .p-datatable-reorderablerow-handle {
        cursor: move;
    }
    
    [super-ReorderableColumn] {
        cursor: move;
    }
    
    /* Loader */
    .p-datatable .p-datatable-loading-overlay {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
    }
    
    /* Filter */
    .p-column-filter-row {
        display: flex;
        align-items: center;
        width: 100%;
    }
    
    .p-column-filter-menu {
        display: inline-flex;
    }
    
    .p-column-filter-row p-columnfilterformelement {
        flex: 1 1 auto;
        width: 1%;
    }
    
    .p-column-filter-menu-button,
    .p-column-filter-clear-button {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        text-decoration: none;
        overflow: hidden;
        position: relative;
    }
    
    .p-column-filter-overlay {
        position: absolute;
        top: 0;
        left: 0;
    }
    
    .p-column-filter-row-items {
        margin: 0;
        padding: 0;
        list-style: none;
    }
    
    .p-column-filter-row-item {
        cursor: pointer;
    }
    
    .p-column-filter-add-button,
    .p-column-filter-remove-button {
        justify-content: center;
    }
    
    .p-column-filter-add-button .p-button-label,
    .p-column-filter-remove-button .p-button-label {f
        flex-grow: 0;
    }
    
    .p-column-filter-buttonbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .p-column-filter-buttonbar .p-button {
        width: auto;
    }
    
    /* Responsive */
    .p-datatable .p-datatable-tbody > tr > td > .p-column-title {
        display: none;
    }
    
    /* Virtual Scroll*/
    
    cdk-virtual-scroll-viewport {
        outline: 0 none;
    }
    `]
})
export class SuperTable extends Table implements OnInit, AfterViewInit, AfterContentInit, BlockableUI, OnChanges {

    @Input() parent: SuperTable | null = null;

    @Input() frozenColumns = [];

    @Input() rowTrackBy = (index: number, item: any):any => item;

    @Input() get columns(): any {
        return this._columns;
    }

    set columns(cols: any) {
        this._columns = cols;
    }

    @Input() get selection(): any {
        return this._selection;
    }

    set selection(val: any) {
        this._selection = val;
        if (this.children.length > 0){
            this.children.forEach(c=>{
                c.selection = val;
                c.selectionChange.emit(c.selection);
            });
        }
    }

    children: SuperTable[] = [];    

    constructor(public el: ElementRef, public zone: NgZone, public tableService: TableService, public cd: ChangeDetectorRef, public filterService: FilterService) {
        super(el, zone, tableService, cd, filterService);
    }

    ngOnInit(): any {
        super.ngOnInit();
        if (this.parent !== null){
            this.parent.children.push(this);
            const child = this;
            const parent = this.parent;
            setTimeout(function() : void{
                let state: TableState = {};
                parent.saveColumnWidths(state);
                (child.columnWidthsState as any) = state.columnWidths;
                child.restoreColumnWidths();
            }, 0);
        }
    }

    ngOnChanges(simpleChange: any): any{
        super.ngOnChanges(simpleChange);
        if (this.parent !== null){
            this._selection = this.parent?._selection;
            this.selectionKeys = this.parent?.selectionKeys;
        }
    }

    onColumnResizeEnd(event:any, column:any) {
        super.onColumnResizeEnd(event, column);
        let state: TableState = {};
        this.saveColumnWidths(state);
        this.children.forEach(child=>{
            (child.columnWidthsState as any) = state.columnWidths;
            child.restoreColumnWidths();
        });
    }
}

@Component({
    selector: '[super-table-body]',
    template: `
        <ng-container *ngIf="!dt.expandedRowTemplate && !dt.virtualScroll">
            <ng-template    ngFor let-rowData let-rowIndex="index" [ngForOf]="(dt.paginator && !dt.lazy) ? ((dt.filteredValue||dt.value) | slice:dt.first:(dt.first + dt.rows)) : (dt.filteredValue||dt.value)" [ngForTrackBy]="dt.rowTrackBy">
                <ng-container *ngTemplateOutlet="template; context: {$implicit: rowData, rowIndex: dt.paginator ? (dt.first + rowIndex) : rowIndex, columns: columns, editing: (dt.editMode === 'row' && dt.isRowEditing(rowData))}"></ng-container>
            </ng-template>
        </ng-container>
        <ng-container *ngIf="!dt.expandedRowTemplate && dt.virtualScroll">
            <ng-template cdkVirtualFor let-rowData let-rowIndex="index" [cdkVirtualForOf]="dt.filteredValue||dt.value" [cdkVirtualForTrackBy]="dt.rowTrackBy" [cdkVirtualForTemplateCacheSize]="0">
                <ng-container *ngTemplateOutlet="rowData ? template: dt.loadingBodyTemplate; context: {$implicit: rowData, rowIndex: dt.paginator ? (dt.first + rowIndex) : rowIndex, columns: columns, editing: (dt.editMode === 'row' && dt.isRowEditing(rowData))}"></ng-container>
            </ng-template>
        </ng-container>
        <ng-container *ngIf="dt.expandedRowTemplate && !(frozen && dt.frozenExpandedRowTemplate)">
            <ng-template ngFor let-rowData let-rowIndex="index" [ngForOf]="(dt.paginator && !dt.lazy) ? ((dt.filteredValue||dt.value) | slice:dt.first:(dt.first + dt.rows)) : (dt.filteredValue||dt.value)" [ngForTrackBy]="dt.rowTrackBy">
                <ng-container *ngTemplateOutlet="template; context: {$implicit: rowData, rowIndex: dt.paginator ? (dt.first + rowIndex) : rowIndex, columns: columns, expanded: dt.isRowExpanded(rowData), editing: (dt.editMode === 'row' && dt.isRowEditing(rowData))}"></ng-container>
                <ng-container *ngIf="dt.isRowExpanded(rowData)">
                    <ng-container *ngTemplateOutlet="dt.expandedRowTemplate; context: {$implicit: rowData, rowIndex: dt.paginator ? (dt.first + rowIndex) : rowIndex, columns: columns}"></ng-container>
                </ng-container>
            </ng-template>
        </ng-container>
        <ng-container *ngIf="dt.frozenExpandedRowTemplate && frozen">
            <ng-template ngFor let-rowData let-rowIndex="index" [ngForOf]="(dt.paginator && !dt.lazy) ? ((dt.filteredValue||dt.value) | slice:dt.first:(dt.first + dt.rows)) : (dt.filteredValue||dt.value)" [ngForTrackBy]="dt.rowTrackBy">
                <ng-container *ngTemplateOutlet="template; context: {$implicit: rowData, rowIndex: dt.paginator ? (dt.first + rowIndex) : rowIndex, columns: columns, expanded: dt.isRowExpanded(rowData), editing: (dt.editMode === 'row' && dt.isRowEditing(rowData))}"></ng-container>
                <ng-container *ngIf="dt.isRowExpanded(rowData)">
                    <ng-container *ngTemplateOutlet="dt.frozenExpandedRowTemplate; context: {$implicit: rowData, rowIndex: dt.paginator ? (dt.first + rowIndex) : rowIndex, columns: columns}"></ng-container>
                </ng-container>
            </ng-template>
        </ng-container>
        <ng-container *ngIf="dt.loading">
            <ng-container *ngTemplateOutlet="dt.loadingBodyTemplate; context: {$implicit: columns, frozen: frozen}"></ng-container>
        </ng-container>
        <ng-container *ngIf="dt.isEmpty() && !dt.loading">
            <ng-container *ngTemplateOutlet="dt.emptyMessageTemplate; context: {$implicit: columns, frozen: frozen}"></ng-container>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None
})
export class SuperTableBody extends TableBody implements OnDestroy {
    @Input("super-table-body") columns= [];

    @Input("pTableBodyTemplate") template: any;
    constructor(public dt: SuperTable, public tableService: TableService, public cd: ChangeDetectorRef) {
        super(dt, tableService, cd);
    }
}

@Component({
    selector: '[super-scrollable-view]',
    template: `
        <div #scrollHeader class="p-datatable-scrollable-header">
            <div #scrollHeaderBox class="p-datatable-scrollable-header-box">
                <table class="p-datatable-scrollable-header-table" [ngClass]="dt.tableStyleClass" [ngStyle]="dt.tableStyle">
                    <ng-container *ngTemplateOutlet="frozen ? dt.frozenColGroupTemplate||dt.colGroupTemplate : dt.colGroupTemplate; context {$implicit: columns}"></ng-container>
                    <thead class="p-datatable-thead">
                        <ng-container *ngTemplateOutlet="frozen ? dt.frozenHeaderTemplate||dt.headerTemplate : dt.headerTemplate; context {$implicit: columns}"></ng-container>
                    </thead>
                    <tbody class="p-datatable-tbody">
                        <ng-template ngFor let-rowData let-rowIndex="index" [ngForOf]="dt.frozenValue" [ngForTrackBy]="dt.rowTrackBy">
                            <ng-container *ngTemplateOutlet="dt.frozenRowsTemplate; context: {$implicit: rowData, rowIndex: rowIndex, columns: columns}"></ng-container>
                        </ng-template>
                    </tbody>
                </table>
            </div>
        </div>
        <ng-container *ngIf="!dt.virtualScroll; else virtualScrollTemplate">
            <div #scrollBody class="p-datatable-scrollable-body" [ngStyle]="{'max-height': dt.scrollHeight !== 'flex' ? scrollHeight : undefined, 'overflow-y': !frozen && dt.scrollHeight ? 'scroll' : undefined}">
                <table #scrollTable [class]="dt.tableStyleClass" [ngStyle]="dt.tableStyle">
                    <ng-container *ngTemplateOutlet="frozen ? dt.frozenColGroupTemplate||dt.colGroupTemplate : dt.colGroupTemplate; context {$implicit: columns}"></ng-container>
                    <tbody class="p-datatable-tbody" [super-table-body]="columns" [pTableBodyTemplate]="frozen ? dt.frozenBodyTemplate||dt.bodyTemplate : dt.bodyTemplate" [frozen]="frozen"></tbody>
                </table>
                <div #scrollableAligner style="background-color:transparent" *ngIf="frozen"></div>
            </div>
        </ng-container>
        <ng-template #virtualScrollTemplate>
            <cdk-virtual-scroll-viewport [itemSize]="dt.virtualRowHeight" tabindex="0" [style.height]="dt.scrollHeight !== 'flex' ? scrollHeight : undefined"
                    [minBufferPx]="dt.minBufferPx" [maxBufferPx]="dt.maxBufferPx" (scrolledIndexChange)="onScrollIndexChange($event)" class="p-datatable-virtual-scrollable-body">
                <table #scrollTable [class]="dt.tableStyleClass" [ngStyle]="dt.tableStyle">
                    <ng-container *ngTemplateOutlet="frozen ? dt.frozenColGroupTemplate||dt.colGroupTemplate : dt.colGroupTemplate; context {$implicit: columns}"></ng-container>
                    <tbody class="p-datatable-tbody" [super-table-body]="columns" [pTableBodyTemplate]="frozen ? dt.frozenBodyTemplate||dt.bodyTemplate : dt.bodyTemplate" [frozen]="frozen"></tbody>
                </table>
                <div #scrollableAligner style="background-color:transparent" *ngIf="frozen"></div>
            </cdk-virtual-scroll-viewport>
        </ng-template>
        <div #scrollFooter class="p-datatable-scrollable-footer">
            <div #scrollFooterBox class="p-datatable-scrollable-footer-box">
                <table class="p-datatable-scrollable-footer-table" [ngClass]="dt.tableStyleClass" [ngStyle]="dt.tableStyle">
                    <ng-container *ngTemplateOutlet="frozen ? dt.frozenColGroupTemplate||dt.colGroupTemplate : dt.colGroupTemplate; context {$implicit: columns}"></ng-container>
                    <tfoot class="p-datatable-tfoot">
                        <ng-container *ngTemplateOutlet="frozen ? dt.frozenFooterTemplate||dt.footerTemplate : dt.footerTemplate; context {$implicit: columns}"></ng-container>
                    </tfoot>
                </table>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.None
})
export class SuperScrollableView extends ScrollableView implements AfterViewInit,OnDestroy {
    @Input("super-scrollable-view") columns= [];
    constructor(public dt: SuperTable, public el: ElementRef, public zone: NgZone) {
        super(dt, el, zone);
    }

    ngAfterViewInit(): any {
        super.ngAfterViewInit();
    }

    ngOnDestroy(): any {
        super.ngOnDestroy();
    }
}

@Directive({
    selector: '[super-SortableColumn]',
    host: {
        '[class.p-sortable-column]': 'isEnabled()',
        '[class.p-highlight]': 'sorted',
        '[attr.tabindex]': 'isEnabled() ? "0" : null',
        '[attr.role]': '"columnheader"',
        '[attr.aria-sort]': 'sortOrder'
    }
})
export class SuperSortableColumn extends SortableColumn implements OnInit, OnDestroy {
    @Input("super-SortableColumn") field= "";
    constructor(public dt: SuperTable) {
        super(dt);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

}

@Component({
    selector: 'super-sortIcon',
    template: `
        <i class="p-sortable-column-icon pi pi-fw" [ngClass]="{'pi-sort-amount-up-alt': sortOrder === 1, 'pi-sort-amount-down': sortOrder === -1, 'pi-sort-alt': sortOrder === 0}"></i>
        <span *ngIf="isMultiSorted()" class="p-sortable-column-badge">{{getMultiSortMetaIndex() + 1}}</span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SuperSortIcon extends SortIcon implements OnInit, OnDestroy {

    constructor(public dt: SuperTable, public cd: ChangeDetectorRef) {
        super(dt, cd);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}

@Directive({
    selector: '[super-selectable-row]',
    host: {
        '[class.p-selectable-row]': 'isEnabled()',
        '[class.p-highlight]': 'selected',
        '[attr.tabindex]': 'isEnabled() ? 0 : undefined'
    }
})
export class SuperSelectableRow extends SelectableRow implements OnInit, OnDestroy {

    @Input("super-selectable-row") data: any;

    constructor(public dt: SuperTable, public tableService: TableService) {
        super(dt, tableService);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

}

@Directive({
    selector: '[super-ContextMenuRow]',
    host: {
        '[class.p-highlight-contextmenu]': 'selected',
        '[attr.tabindex]': 'isEnabled() ? 0 : undefined'
    }
})
export class SuperContextMenuRow extends ContextMenuRow {
    @Input("super-ContextMenuRow") data: any;
    constructor(public dt: SuperTable, public tableService: TableService, el: ElementRef) {
        super(dt, tableService, el);
    }
}

@Directive({
    selector: '[super-RowToggler]'
})
export class SuperRowToggler extends RowToggler {

    @Input('super-RowToggler') data: any;

    constructor(public dt: SuperTable) { 
        super(dt);
    }
}

@Directive({
    selector: '[super-ResizableColumn]'
})
export class SuperResizableColumn extends ResizableColumn implements AfterViewInit, OnDestroy {

    constructor(public dt: SuperTable, public el: ElementRef, public zone: NgZone) { 
        super(dt, el, zone);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}

@Directive({
    selector: '[super-ReorderableColumn]'
})
export class SuperReorderableColumn extends ReorderableColumn implements AfterViewInit, OnDestroy {
    constructor(public dt: SuperTable, public el: ElementRef, public zone: NgZone) { 
        super(dt, el, zone);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

}

@Directive({
    selector: '[super-EditableColumn]'
})
export class SuperEditableColumn extends EditableColumn implements AfterViewInit {

    constructor(public dt: SuperTable, public el: ElementRef, public zone: NgZone) {
        super(dt, el, zone);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }
}

@Directive({
    selector: '[pEditableRow]'
})
export class EditableRow {

    @Input("pEditableRow") data: any;

    @Input() pEditableRowDisabled= false;

    constructor(public el: ElementRef) {}

    isEnabled() {
        return this.pEditableRowDisabled !== true;
    }

}

@Directive({
    selector: '[pInitEditableRow]'
})
export class InitEditableRow {

    constructor(public dt: SuperTable, public editableRow: EditableRow) {}

    @HostListener('click', ['$event'])
    onClick(event: Event) {
        this.dt.initRowEdit(this.editableRow.data);
        event.preventDefault();
    }

}

@Directive({
    selector: '[pSaveEditableRow]'
})
export class SaveEditableRow {

    constructor(public dt: SuperTable, public editableRow: EditableRow) {}

    @HostListener('click', ['$event'])
    onClick(event: Event) {
        this.dt.saveRowEdit(this.editableRow.data, this.editableRow.el.nativeElement);
        event.preventDefault();
    }
}

@Directive({
    selector: '[pCancelEditableRow]'
})
export class CancelEditableRow {

    constructor(public dt: SuperTable, public editableRow: EditableRow) {}

    @HostListener('click', ['$event'])
    onClick(event: Event) {
        this.dt.cancelRowEdit(this.editableRow.data);
        event.preventDefault();
    }
}

@Component({
    selector: 'p-cellEditor',
    template: `
        <ng-container *ngIf="editing">
            <ng-container *ngTemplateOutlet="inputTemplate"></ng-container>
        </ng-container>
        <ng-container *ngIf="!editing">
            <ng-container *ngTemplateOutlet="outputTemplate"></ng-container>
        </ng-container>
    `,
    encapsulation: ViewEncapsulation.None
})
export class SuperCellEditor extends CellEditor implements AfterContentInit {


    constructor(public dt: SuperTable, @Optional() public editableColumn: SuperEditableColumn, @Optional() public editableRow: EditableRow) {
        super(dt, editableColumn, editableRow);
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
    }
}

@Component({
    selector: 'super-tableRadioButton',
    template: `
        <div class="p-radiobutton p-component" (click)="onClick($event)">
            <div class="p-hidden-accessible">
                <input type="radio" [attr.id]="inputId" [attr.name]="name" [checked]="checked" (focus)="onFocus()" (blur)="onBlur()"
                [disabled]="disabled" [attr.aria-label]="ariaLabel">
            </div>
            <div #box [ngClass]="{'p-radiobutton-box p-component':true,
                'p-highlight':checked, 'p-disabled':disabled}" role="radio" [attr.aria-checked]="checked">
                <div class="p-radiobutton-icon"></div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SuperTableRadioButton extends TableRadioButton  {
    
    constructor(public dt: SuperTable, public tableService: TableService, public cd: ChangeDetectorRef) {
        super(dt, tableService, cd);
    }

    ngOnInit() {
        this.checked = this.dt.isSelected(this.value);
    }

}

@Component({
    selector: 'super-tableCheckbox',
    template: `
        <div class="p-checkbox p-component" (click)="onClick($event)">
            <div class="p-hidden-accessible">
                <input type="checkbox" [attr.id]="inputId" [attr.name]="name" [checked]="checked" (focus)="onFocus()" (blur)="onBlur()" [disabled]="disabled"
                [attr.required]="required" [attr.aria-label]="ariaLabel">
            </div>
            <div #box [ngClass]="{'p-checkbox-box p-component':true,
                'p-highlight':checked, 'p-disabled':disabled}" role="checkbox" [attr.aria-checked]="checked">
                <span class="p-checkbox-icon" [ngClass]="{'pi pi-check':checked}"></span>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SuperTableCheckbox extends TableCheckbox  {

    constructor(public dt: SuperTable, public tableService: TableService, public cd: ChangeDetectorRef) {
        super(dt, tableService, cd);
    }

    onClick(event: Event) {
        const dt = this.dt;
        if (dt.parent !== null){
            // perform the change using rows selected in the parent
            dt.selection = dt.parent.selection;
            dt.selectionKeys = dt.parent.selectionKeys;
        }
        super.onClick(event);
        if (dt.parent !== null){
            // insure the parent sees the change
            dt.parent.selection = dt.selection;
            dt.parent.selectionKeys = dt.selectionKeys;
        }
        if (dt.parent !== null){
            dt.parent.children.forEach(c=>{
                if (c !== dt){
                    // insure each child has the same selection
                    c.selection = dt.selection;
                    c.selectionKeys = dt.selectionKeys;
                    // chanage the visual checkboxes
                    c.tableService.onSelectionChange();
                }
            });
            // notify the component's owner
            dt.parent?.selectionChange.emit(dt.parent.selection);
        }
    }
}

@Component({
    selector: 'super-tableHeaderCheckbox',
    template: `
        <div class="p-checkbox p-component" (click)="onClick($event)">
            <div class="p-hidden-accessible">
                <input #cb type="checkbox" [attr.id]="inputId" [attr.name]="name" [checked]="checked" (focus)="onFocus()" (blur)="onBlur()"
                [disabled]="isDisabled()" [attr.aria-label]="ariaLabel">
            </div>
            <div #box [ngClass]="{'p-checkbox-box':true,
                'p-highlight':checked, 'p-disabled': isDisabled()}" role="checkbox" [attr.aria-checked]="checked">
                <span class="p-checkbox-icon" [ngClass]="{'pi pi-check':checked}"></span>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SuperTableHeaderCheckbox extends TableHeaderCheckbox  {
    constructor(public dt: SuperTable, public tableService: TableService, public cd: ChangeDetectorRef) {
        super(dt, tableService, cd);
    }
}

@Directive({
    selector: '[pReorderableRowHandle]'
})
export class ReorderableRowHandle implements AfterViewInit {

    @Input("pReorderableRowHandle") index= 0;

    constructor(public el: ElementRef) {}

    ngAfterViewInit() {
        DomHandler.addClass(this.el.nativeElement, 'p-datatable-reorderablerow-handle');
    }
}

@Directive({
    selector: '[super-reorderable-row]'
})
export class SuperReorderableRow extends ReorderableRow implements AfterViewInit {

    @Input("super-reorderable-row") index= 0;

    constructor(public dt: SuperTable, public el: ElementRef, public zone: NgZone) {
        super (dt, el, zone);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }
}

@Component({
    selector: 'super-columnFilterFormElement',
    template: `
        <ng-container *ngIf="filterTemplate; else builtInElement">
            <ng-container *ngTemplateOutlet="filterTemplate; context: {$implicit: filterConstraint?.value, filterCallback: filterCallback}"></ng-container>
        </ng-container>
        <ng-template #builtInElement>
            <ng-container [ngSwitch]="type">
                <input *ngSwitchCase="'text'" type="text" pInputText [value]="filterConstraint?.value" (input)="onModelChange($event)"
                    (keydown.enter)="onTextInputEnterKeyDown($event)" [attr.placeholder]="placeholder">
                <p-inputNumber *ngSwitchCase="'numeric'" [ngModel]="filterConstraint?.value" (ngModelChange)="onModelChange($event)" (onKeyDown)="onNumericInputKeyDown($event)" [showButtons]="true" [attr.placeholder]="placeholder"
                    [minFractionDigits]="minFractionDigits" [maxFractionDigits]="maxFractionDigits" [prefix]="prefix" [suffix]="suffix" [placeholder]="placeholder"
                    [mode]="currency ? 'currency' : 'decimal'" [locale]="locale" [localeMatcher]="localeMatcher" [currency]="currency" [currencyDisplay]="currencyDisplay" [useGrouping]="useGrouping"></p-inputNumber>
                <p-triStateCheckbox *ngSwitchCase="'boolean'" [ngModel]="filterConstraint?.value" (ngModelChange)="onModelChange($event)"></p-triStateCheckbox>
                <p-calendar *ngSwitchCase="'date'" [ngModel]="filterConstraint?.value" (ngModelChange)="onModelChange($event)"></p-calendar>
            </ng-container>
        </ng-template>
    `,
    encapsulation: ViewEncapsulation.None
})
export class SuperColumnFilterFormElement extends ColumnFilterFormElement implements OnInit {
    @Input() filterConstraint: any;    
    constructor(public dt: SuperTable) {
        super(dt);
    }

    ngOnInit() {
        super.ngOnInit();
    }
    onModelChange(event: any) {
        (this.filterConstraint as any).value = event.target.value;

        if (this.type === 'boolean' || event.target.value === '') {
            this.dt._filter();
        }
    }
    onTextInputEnterKeyDown(event: any) {
        super.onTextInputEnterKeyDown(event);
    }

}

@Component({
    selector: 'super-columnFilter',
    template: `
        <div class="p-column-filter" [ngClass]="{'p-column-filter-row': display === 'row', 'p-column-filter-menu': display === 'menu'}">
            <super-columnFilterFormElement *ngIf="display === 'row'" class="p-fluid" [type]="type" [field]="field" [filterConstraint]="dt.filters[field]" [filterTemplate]="filterTemplate" [placeholder]="placeholder" [minFractionDigits]="minFractionDigits" [maxFractionDigits]="maxFractionDigits" [prefix]="prefix" [suffix]="suffix"
                                    [locale]="locale"  [localeMatcher]="localeMatcher" [currency]="currency" [currencyDisplay]="currencyDisplay" [useGrouping]="useGrouping"></super-columnFilterFormElement>
            <button #icon *ngIf="showMenuButton" type="button" class="p-column-filter-menu-button p-link" aria-haspopup="true" [attr.aria-expanded]="overlayVisible"
                [ngClass]="{'p-column-filter-menu-button-open': overlayVisible, 'p-column-filter-menu-button-active': hasFilter()}" 
                (click)="toggleMenu()" (keydown)="onToggleButtonKeyDown($event)"><span class="pi pi-filter-icon pi-filter"></span></button>
            <button #icon *ngIf="showMenuButton && display === 'row'" [ngClass]="{'p-hidden-space': !hasRowFilter()}" type="button" class="p-column-filter-clear-button p-link" (click)="clearFilter()"><span class="pi pi-filter-slash"></span></button>
            <div *ngIf="showMenu && overlayVisible" [ngClass]="{'p-column-filter-overlay p-component p-fluid': true, 'p-column-filter-overlay-menu': display === 'menu'}" 
                [@overlayAnimation]="'visible'" (@overlayAnimation.start)="onOverlayAnimationStart($event)" (keydown.escape)="onEscape()">
                <ng-container *ngTemplateOutlet="headerTemplate; context: {$implicit: field}"></ng-container>
                <ul *ngIf="display === 'row'; else menu" class="p-column-filter-row-items">
                    <li class="p-column-filter-row-item" *ngFor="let matchMode of matchModes; let i = index;" (click)="onRowMatchModeChange(matchMode.value)" (keydown)="onRowMatchModeKeyDown($event)" (keydown.enter)="this.onRowMatchModeChange(matchMode.value)"
                        [ngClass]="{'p-highlight': isRowMatchModeSelected(matchMode.value)}" [attr.tabindex]="i === 0 ? '0' : null">{{matchMode.label}}</li>
                    <li class="p-column-filter-separator"></li>
                    <li class="p-column-filter-row-item" (click)="onRowClearItemClick()" (keydown)="onRowMatchModeKeyDown($event)" (keydown.enter)="onRowClearItemClick()">{{noFilterLabel}}</li>
                </ul>
                <ng-template #menu>
                    <div class="p-column-filter-operator" *ngIf="isShowOperator">
                        <p-dropdown [options]="operatorOptions" [ngModel]="operator" (ngModelChange)="onOperatorChange($event)" styleClass="p-column-filter-operator-dropdown"></p-dropdown>
                    </div>
                    <div class="p-column-filter-constraints">
                        <div *ngFor="let fieldConstraint of fieldConstraints; let i = index" class="p-column-filter-constraint">
                            <p-dropdown  *ngIf="showMatchModes && matchModes" [options]="matchModes" [ngModel]="fieldConstraint.matchMode" (ngModelChange)="onMenuMatchModeChange($event, fieldConstraint)" styleClass="p-column-filter-matchmode-dropdown"></p-dropdown>
                            <super-columnFilterFormElement [type]="type" [field]="field" [filterConstraint]="fieldConstraint" [filterTemplate]="filterTemplate" [placeholder]="placeholder"
                            [minFractionDigits]="minFractionDigits" [maxFractionDigits]="maxFractionDigits" [prefix]="prefix" [suffix]="suffix"
                            [locale]="locale"  [localeMatcher]="localeMatcher" [currency]="currency" [currencyDisplay]="currencyDisplay" [useGrouping]="useGrouping"></super-columnFilterFormElement>
                            <div>
                                <button *ngIf="showRemoveIcon" type="button" pButton icon="pi pi-trash" class="p-column-filter-remove-button p-button-text p-button-danger p-button-sm" (click)="removeConstraint(fieldConstraint)" pRipple [label]="removeRuleButtonLabel"></button>
                            </div>
                        </div>
                    </div>
                    <div class="p-column-filter-add-rule" *ngIf="isShowAddConstraint">
                        <button type="button" pButton [label]="addRuleButtonLabel" icon="pi pi-plus" class="p-column-filter-add-button p-button-text p-button-sm" (click)="addConstraint()" pRipple></button>
                    </div>
                    <div class="p-column-filter-buttonbar">
                        <button *ngIf="showClearButton" type="button" pButton class="p-button-outlined" (click)="clearFilter()" [label]="clearButtonLabel" pRipple></button>
                        <button *ngIf="showApplyButton" type="button" pButton (click)="applyFilter()" [label]="applyButtonLabel" pRipple></button>
                    </div>
                </ng-template>
                <ng-container *ngTemplateOutlet="footerTemplate; context: {$implicit: field}"></ng-container>
            </div>
        </div>
    `,
    animations: [
        trigger('overlayAnimation', [
            transition(':enter', [
                style({opacity: 0, transform: 'scaleY(0.8)'}),
                animate('.12s cubic-bezier(0, 0, 0.2, 1)')
            ]),
            transition(':leave', [
                animate('.1s linear', style({ opacity: 0 }))
            ])
        ])
    ],
    encapsulation: ViewEncapsulation.None
})
export class SuperColumnFilter extends ColumnFilter implements AfterContentInit {
    constructor(public el: ElementRef, public dt: SuperTable, public renderer: Renderer2, public config: PrimeNGConfig) {
        super(el, dt, renderer, config);
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
    }
}

@NgModule({
    imports: [CommonModule,PaginatorModule,InputTextModule,DropdownModule,ScrollingModule,FormsModule,ButtonModule,SelectButtonModule,CalendarModule,InputNumberModule,TriStateCheckboxModule],
    exports: [SuperTable,SharedModule,SuperSortableColumn,SuperSelectableRow,SuperRowToggler,SuperContextMenuRow,SuperResizableColumn,SuperReorderableColumn,SuperEditableColumn,SuperCellEditor,SuperSortIcon,
            SuperTableRadioButton,SuperTableCheckbox,SuperTableHeaderCheckbox,ReorderableRowHandle,SuperReorderableRow,EditableRow,InitEditableRow,SaveEditableRow,CancelEditableRow,ScrollingModule,SuperColumnFilter],
    declarations: [SuperTable,SuperSortableColumn,SuperSelectableRow,SuperRowToggler,SuperContextMenuRow,SuperResizableColumn,SuperReorderableColumn,SuperEditableColumn,SuperCellEditor,SuperTableBody,SuperScrollableView,SuperSortIcon,
            SuperTableRadioButton,SuperTableCheckbox,SuperTableHeaderCheckbox,ReorderableRowHandle,SuperReorderableRow,EditableRow,InitEditableRow,SaveEditableRow,CancelEditableRow,SuperColumnFilter,SuperColumnFilterFormElement]
})
export class SuperTableModule { }