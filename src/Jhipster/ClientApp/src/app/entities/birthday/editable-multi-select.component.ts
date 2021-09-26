import { ElementRef, OnInit, ChangeDetectorRef, ViewEncapsulation, forwardRef, ChangeDetectionStrategy} from '@angular/core';
import { FilterService } from 'primeng/api';
import { Component, Renderer2, HostBinding } from '@angular/core';
import { PrimeNGConfig, } from 'primeng/api';
import { MultiSelect, MultiSelectItem} from 'primeng/multiselect';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export const MULTISELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => EditableMultiSelectComponent),
  multi: true
};
@Component({
  selector: 'jhi-editable-multiselect',
  template: `
  <div style='min-width:200px;' #container [ngClass]="{'p-multiselect p-component':true,
  'p-multiselect-open':overlayVisible,
  'p-multiselect-chip': display === 'chip',
  'p-focus':focus,
  'p-disabled': disabled}" [ngStyle]="style" [class]="styleClass"
  (click)="onMouseclick($event,in)">
  <div class="p-hidden-accessible">
      <input #in type="text" readonly="readonly" [attr.id]="inputId" [attr.name]="name" (focus)="onInputFocus($event)" (blur)="onInputBlur($event)"
             [disabled]="disabled" [attr.tabindex]="tabindex" (keydown)="onKeydown($event)" aria-haspopup="listbox" [attr.aria-expanded]="overlayVisible"
             [attr.aria-labelledby]="ariaLabelledBy" role="listbox">
  </div>
  <div class="p-multiselect-label-container" [pTooltip]="tooltip" [tooltipPosition]="tooltipPosition" [positionStyle]="tooltipPositionStyle" [tooltipStyleClass]="tooltipStyleClass">
      <div class="p-multiselect-label" [ngClass]="{'p-placeholder': valuesAsString === (defaultLabel || placeholder), 'p-multiselect-label-empty': ((valuesAsString == null || valuesAsString.length === 0) && (placeholder == null || placeholder.length === 0))}">
          <ng-container *ngIf="!selectedItemsTemplate">
              <ng-container *ngIf="display === 'comma'">{{valuesAsString || 'empty'}}</ng-container>
              <ng-container *ngIf="display === 'chip'">
                  <div #token *ngFor="let item of value; let i = index;" class="p-multiselect-token">
                      <span class="p-multiselect-token-label">{{findLabelByValue(item)}}</span>
                      <span *ngIf="!disabled" class="p-multiselect-token-icon pi pi-times-circle" (click)="removeChip(item, $event)"></span>
                  </div>
                  <ng-container *ngIf="!value || value.length === 0">{{placeholder || defaultLabel || 'empty'}}</ng-container>
              </ng-container>
          </ng-container>
          <ng-container *ngTemplateOutlet="selectedItemsTemplate; context: {$implicit: value}"></ng-container>
      </div>
  </div>
  <div [ngClass]="{'p-multiselect-trigger':true}">
      <span class="p-multiselect-trigger-icon" [ngClass]="dropdownIcon"></span>
  </div>
  <div *ngIf="overlayVisible" [ngClass]="['p-multiselect-panel p-component']" [@overlayAnimation]="{value: 'visible', params: {showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions}}" (@overlayAnimation.start)="onOverlayAnimationStart($event)"
      [ngStyle]="panelStyle" [class]="panelStyleClass" (keydown)="onKeydown($event)">
      <div style="display:flex;" class="p-multiselect-header" *ngIf="showHeader">
          <ng-content select="p-header"></ng-content>
          <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
          <div class="p-checkbox p-component" *ngIf="showToggleAll && !selectionLimit" [ngClass]="{'p-checkbox-disabled': disabled || toggleAllDisabled}">
              <div class="p-hidden-accessible">
                  <input type="checkbox" readonly="readonly" [checked]="allChecked" (focus)="onHeaderCheckboxFocus()" (blur)="onHeaderCheckboxBlur()" (keydown.space)="toggleAll($event)" [attr.disabled]="disabled || toggleAllDisabled">
              </div>
              <div class="p-checkbox-box" role="checkbox" [attr.aria-checked]="allChecked" [ngClass]="{'p-highlight':allChecked, 'p-focus': headerCheckboxFocus, 'p-disabled': disabled || toggleAllDisabled}" (click)="toggleAll($event)">
                  <span class="p-checkbox-icon" [ngClass]="{'pi pi-check':allChecked}"></span>
              </div>
          </div>
          <div class="p-multiselect-filter-container" *ngIf="filter">
              <input #filterInput type="text" role="textbox" [value]="filterValue||''" (input)="onFilterInputChange($event)" class="p-multiselect-filter p-inputtext p-component" [disabled]="disabled" [attr.placeholder]="filterPlaceHolder" [attr.aria-label]="ariaFilterLabel">
              <span class="p-multiselect-filter-icon pi pi-search"></span>
          </div>
          <button class="p-multiselect-close p-link" type="button" (click)="close(in)" pRipple>
              <span class="p-multiselect-close-icon pi pi-times"></span>
          </button>
      </div>
      <div class="p-multiselect-items-wrapper" [style.max-height]="virtualScroll ? 'auto' : (scrollHeight||'auto')">
          <ul class="p-multiselect-items p-component" [ngClass]="{'p-multiselect-virtualscroll': virtualScroll}" role="listbox" aria-multiselectable="true">
              <ng-container *ngIf="group">
                  <ng-template ngFor let-optgroup [ngForOf]="optionsToRender">
                      <li class="p-multiselect-item-group">
                          <span *ngIf="!groupTemplate">{{getOptionGroupLabel(optgroup)||'empty'}}</span>
                          <ng-container *ngTemplateOutlet="groupTemplate; context: {$implicit: optgroup}"></ng-container>
                      </li>
                      <ng-container *ngTemplateOutlet="itemslist; context: {$implicit: getOptionGroupChildren(optgroup)}"></ng-container>
                  </ng-template>
              </ng-container>
              <ng-container *ngIf="!group">
                  <ng-container *ngTemplateOutlet="itemslist; context: {$implicit: optionsToRender}"></ng-container>
              </ng-container>
              <ng-template #itemslist let-optionsToDisplay let-selectedOption="selectedOption">
                  <ng-container *ngIf="!virtualScroll; else virtualScrollList">
                      <ng-template ngFor let-option let-i="index" [ngForOf]="optionsToDisplay">
                          <jhi-editable-multiselect-item [option]="option" [selected]="isSelected(option)" [label]="getOptionLabel(option)" [disabled]="isOptionDisabled(option)" (onClick)="onOptionClick($event)" (onKeydown)="onOptionKeydown($event)"
                                  [template]="itemTemplate"></jhi-editable-multiselect-item>
                      </ng-template>
                  </ng-container>
                  <ng-template #virtualScrollList>
                      <cdk-virtual-scroll-viewport #viewport [ngStyle]="{'height': scrollHeight}" [itemSize]="itemSize" *ngIf="virtualScroll && !emptyOptions">
                          <ng-container *cdkVirtualFor="let option of optionsToDisplay; let i = index; let c = count; let f = first; let l = last; let e = even; let o = odd">
                              <jhi-editable-multiselect-item [option]="option" [selected]="isSelected(option)" [label]="getOptionLabel(option)" [disabled]="isOptionDisabled(option)" (onClick)="onOptionClick($event)" (onKeydown)="onOptionKeydown($event)"
                                  [template]="itemTemplate" [itemSize]="itemSize"></jhi-editable-multiselect-item>
                          </ng-container>
                      </cdk-virtual-scroll-viewport>
                  </ng-template>
                  <span *ngIf="hasFilter() && emptyOptions" class="p-multiselect-empty-message">
                      <ng-container *ngIf="!emptyFilterTemplate && !emptyTemplate">
                          {{emptyFilterMessageLabel}}
                      </ng-container>
                      <ng-container #emptyFilter *ngTemplateOutlet="emptyFilterTemplate || emptyTemplate"></ng-container>
                  </span>
                  <span *ngIf="!hasFilter() && emptyOptions" class="p-multiselect-empty-message">
                      <ng-container *ngIf="!emptyTemplate;">
                          {{emptyMessageLabel}}
                      </ng-container>
                      <ng-container #empty *ngTemplateOutlet="emptyTemplate"></ng-container>
                  </span>
              </ng-template>
          </ul>
      </div>
      <div class="p-multiselect-footer" *ngIf="footerFacet || footerTemplate">
          <ng-content select="p-footer"></ng-content>
          <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
      </div>
  </div>
</div>
  `,
  providers: [MULTISELECT_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class EditableMultiSelectComponent extends MultiSelect implements OnInit{
  selected : string[] = []

  get toggleAllDisabled():boolean{
    if (this.value.length === 0 && !this._filterValue){
      return true;
    }
    return false;
  }
  constructor(public el: ElementRef, public renderer: Renderer2, public cd: ChangeDetectorRef, public filterService: FilterService, public config: PrimeNGConfig  ) {
    super(el, renderer, cd, filterService, config);

  }
  // the following is necessary to preven a type mismatch on event
  onFilterInputChange(event : any): void{
    super.onFilterInputChange(event);
  }
  onKeydown(event : any) : void {
    if (event.which === 13) {
      this.toggleAll(event);
      return;
    } else if (event.which === 9 ){
      const searchFields = (this.filterBy || this.optionLabel || 'label').split(',');
      const matched = this.filterService.filter(this.options, searchFields, this._filterValue, 'contains', this.filterLocale);
      if (matched.length === 1){
        this.filterValue = matched[0][this.optionLabel];
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
    super.onKeydown(event);
  }
  toggleAll(event : any): void{
    // toggleAllDisabled is overloaded to add values
    const searchFields = (this.filterBy || this.optionLabel || 'label').split(',');
    const matched = this.filterService.filter(this.options, searchFields, this._filterValue, 'equals', this.filterLocale);
    if (matched.length === 1){
      const optionClickParm = {};
      optionClickParm["option"] = matched[0];
      this.onOptionClick(optionClickParm);
      this.filterValue = "";
      return;      
    }
    if (!this._filterValue){
      let filteringAllSelected = !!this._filteredOptions;
      if (this._filteredOptions){
        this._filteredOptions.forEach(o=>{
          if (!this.isSelected(o)){
            filteringAllSelected = false;
          }
        });
      }
      if (filteringAllSelected){
        (this._filteredOptions as unknown) = null;
        this._filterValue = "";
      } else if (this.value.length > 0) {
        this._filteredOptions = [];
        this._options.forEach(o=>{
          if (this.isSelected(o)){
            this._filteredOptions.push(o);
          }
        });
      }
      return;
    } else if (event) { // (testing for event in order to avoid a lint warning)
      // add this value to options
      const option = {};
      option[this.optionLabel] = this._filterValue
      this.options.unshift(option);
      const optionClickParm = {};
      optionClickParm["option"] = option;
      this.onOptionClick(optionClickParm);
      this._filterValue = "";
      this.activateFilter();
    }
  }
  close(input: any) :void{
    this._filterValue = "";
    this.activateFilter();
    input.focus();
  }
}
@Component({
    selector: 'jhi-editable-multiselect-item',
    template: `
        <li class="p-multiselect-item" (click)="onOptionClick($event)" (keydown)="onOptionKeydown($event)" [attr.aria-label]="label"
            [attr.tabindex]="disabled ? null : '0'" [ngStyle]="{'height': itemSize + 'px'}"
            [ngClass]="{'p-highlight': selected, 'p-disabled': disabled}" pRipple>
            <div class="p-checkbox p-component">
                <div class="p-checkbox-box" [ngClass]="{'p-highlight': selected}">
                    <span class="p-checkbox-icon" [ngClass]="{'pi pi-check': selected}"></span>
                </div>
            </div>
            <span *ngIf="!template">{{label}}</span>
            <ng-container *ngTemplateOutlet="template; context: {$implicit: option}"></ng-container>
        </li>
    `,
    encapsulation: ViewEncapsulation.None,
})
export class MultiSelectItemComponent extends MultiSelectItem {
  @HostBinding('class') role = 'p-element';  
}
