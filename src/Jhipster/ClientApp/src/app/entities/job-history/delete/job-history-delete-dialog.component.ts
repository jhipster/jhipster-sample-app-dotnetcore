import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IJobHistory } from '../job-history.model';
import { JobHistoryService } from '../service/job-history.service';

@Component({
  standalone: true,
  templateUrl: './job-history-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class JobHistoryDeleteDialogComponent {
  jobHistory?: IJobHistory;

  constructor(
    protected jobHistoryService: JobHistoryService,
    protected activeModal: NgbActiveModal,
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.jobHistoryService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
