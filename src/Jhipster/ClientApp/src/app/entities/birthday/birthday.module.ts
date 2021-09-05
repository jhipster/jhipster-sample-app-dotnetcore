import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { JhipsterSharedModule } from 'app/shared/shared.module';
import { BirthdayComponent } from './birthday.component';
import { BirthdayDetailComponent } from './birthday-detail.component';
// import { BirthdayUpdateComponent } from './birthday-update.component';
// import { BirthdayDeleteDialogComponent } from './birthday-delete-dialog.component';
import { birthdayRoute } from './birthday.route';
/* import { AgGridModule } from 'ag-grid-angular'; */
import { TableModule } from 'primeng/table';
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

@NgModule({
  imports: [JhipsterSharedModule, RouterModule.forChild(birthdayRoute), TableModule, CalendarModule, ContextMenuModule, MessagesModule, ChipsModule, ConfirmPopupModule, TooltipModule, ScrollTopModule, MenuModule, DialogModule, BirthdayQueryBuilderModule],
declarations: [BirthdayComponent, BirthdayDetailComponent /* , BirthdayUpdateComponent, BirthdayDeleteDialogComponent*/],
  entryComponents: [/* BirthdayDeleteDialogComponent*/],
})
export class JhipsterBirthdayModule {}
