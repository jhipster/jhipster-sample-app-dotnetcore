import { NgModule }      from '@angular/core';
import { EditableMultiSelectComponent } from './editable-multi-select.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';



@NgModule({
  imports:[ MultiSelectModule, FormsModule ],
  declarations: [EditableMultiSelectComponent],
  bootstrap: [EditableMultiSelectComponent],
  exports: [EditableMultiSelectComponent]
})
export class EditableMultiSelectModule { }