import { NgModule }      from '@angular/core';
import { EditableMultiSelectComponent, MultiSelectItemComponent } from './editable-multi-select.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';



@NgModule({
  imports:[ MultiSelectModule, FormsModule, CommonModule, TooltipModule ],
  declarations: [EditableMultiSelectComponent, MultiSelectItemComponent],
  bootstrap: [EditableMultiSelectComponent],
  exports: [EditableMultiSelectComponent]
})
export class EditableMultiSelectModule { }