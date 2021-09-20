import { ElementRef, OnInit, ChangeDetectorRef, Input} from '@angular/core';
import { FilterService } from 'primeng/api';
import { Component, Renderer2 } from '@angular/core';
import { PrimeNGConfig, } from 'primeng/api';
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: 'jhi-editable-multiselect',
  template: `
  <p-multiSelect 
    [(ngModel)] = "ngModel"
    appendTo="body" 
    defaultLabel="{{_defaultLabel}}"
    [options]="_options"
    optionLabel="{{optionLabel}}"
    [baseZIndex]="10000"
  >
  </p-multiSelect>
  <h6>{{ngModel.length}}</h6>
  `,

})

export class EditableMultiSelectComponent extends MultiSelect implements OnInit{
  selected : string[] = []
  @Input() ngModel: any;

  constructor(public el: ElementRef, public renderer: Renderer2, public cd: ChangeDetectorRef, public filterService: FilterService, public config: PrimeNGConfig  ) {
    super(el, renderer, cd, filterService, config);
  }
}



