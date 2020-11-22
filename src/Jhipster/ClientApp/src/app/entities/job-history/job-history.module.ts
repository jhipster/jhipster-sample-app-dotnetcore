import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { JhipsterSharedModule } from 'app/shared/shared.module';
import { JobHistoryComponent } from './job-history.component';
import { JobHistoryDetailComponent } from './job-history-detail.component';
import { JobHistoryUpdateComponent } from './job-history-update.component';
import { JobHistoryDeleteDialogComponent } from './job-history-delete-dialog.component';
import { jobHistoryRoute } from './job-history.route';

@NgModule({
  imports: [JhipsterSharedModule, RouterModule.forChild(jobHistoryRoute)],
  declarations: [JobHistoryComponent, JobHistoryDetailComponent, JobHistoryUpdateComponent, JobHistoryDeleteDialogComponent],
  entryComponents: [JobHistoryDeleteDialogComponent],
})
export class JhipsterJobHistoryModule {}
