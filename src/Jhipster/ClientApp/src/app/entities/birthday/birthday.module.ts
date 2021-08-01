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

@NgModule({
  imports: [JhipsterSharedModule, RouterModule.forChild(birthdayRoute), TableModule, CalendarModule, ContextMenuModule, MessagesModule],
declarations: [BirthdayComponent, BirthdayDetailComponent /* , BirthdayUpdateComponent, BirthdayDeleteDialogComponent*/],
  entryComponents: [/* BirthdayDeleteDialogComponent*/],
})
export class JhipsterBirthdayModule {}
