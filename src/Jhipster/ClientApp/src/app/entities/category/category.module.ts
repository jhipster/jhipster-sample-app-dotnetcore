import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { JhipsterSharedModule } from 'app/shared/shared.module';
import { CategoryComponent } from './category.component';
import { CategoryDetailComponent } from './category-detail.component';
// import { CategoryUpdateComponent } from './category-update.component';
// import { CategoryDeleteDialogComponent } from './category-delete-dialog.component';
import { categoryRoute } from './category.route';
/* import { AgGridModule } from 'ag-grid-angular'; */
import { SuperTableModule } from '../birthday/super-table';
import { CalendarModule } from 'primeng/calendar';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MessagesModule } from 'primeng/messages';
import { ChipsModule } from 'primeng/chips';
import { ConfirmPopupModule } from "primeng/confirmpopup";
import {TooltipModule} from 'primeng/tooltip';
import {ScrollTopModule} from 'primeng/scrolltop';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { BirthdayTableModule } from '../birthday/birthday-table.module';

@NgModule({
  imports: [JhipsterSharedModule, RouterModule.forChild(categoryRoute), SuperTableModule, CalendarModule, ContextMenuModule, MessagesModule, ChipsModule, ConfirmPopupModule, TooltipModule, ScrollTopModule, MenuModule, DialogModule, BirthdayTableModule],
declarations: [CategoryComponent, CategoryDetailComponent /* , CategoryUpdateComponent, CategoryDeleteDialogComponent*/],
  entryComponents: [/* CategoryDeleteDialogComponent*/],
})
export class JhipsterCategoryModule {}
