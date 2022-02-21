import { NgModule } from '@angular/core';
import { BirthdayTableComponent } from './birthday-table.component';
// import { BirthdayUpdateComponent } from './birthday-update.component';
// import { BirthdayDeleteDialogComponent } from './birthday-delete-dialog.component';
/* import { AgGridModule } from 'ag-grid-angular'; */
import { SuperTableModule } from './super-table';
import { CalendarModule } from 'primeng/calendar';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MessagesModule } from 'primeng/messages';
import { ChipsModule } from 'primeng/chips';
import { ConfirmPopupModule } from "primeng/confirmpopup";
import {TooltipModule} from 'primeng/tooltip';
import {ScrollTopModule} from 'primeng/scrolltop';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { BirthdayQueryBuilderModule } from './birthday-query-builder.module';
import { EditableMultiSelectModule } from './editable-multi-select.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, SuperTableModule, CalendarModule, ContextMenuModule, MessagesModule, ChipsModule, ConfirmPopupModule, TooltipModule, ScrollTopModule, MenuModule, DialogModule, BirthdayQueryBuilderModule, EditableMultiSelectModule, FormsModule],
declarations: [BirthdayTableComponent, /* , BirthdayUpdateComponent, BirthdayDeleteDialogComponent*/],
  entryComponents: [/* BirthdayDeleteDialogComponent*/],
  exports: [BirthdayTableComponent]
})
export class BirthdayTableModule {}
