import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IJob } from '../job.model';
import { JobService } from '../service/job.service';

@Component({
  standalone: true,
  templateUrl: './job-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class JobDeleteDialogComponent {
  job?: IJob;

  constructor(
    protected jobService: JobService,
    protected activeModal: NgbActiveModal,
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.jobService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
