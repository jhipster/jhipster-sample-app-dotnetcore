import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ITimeSheetEntry } from '../time-sheet-entry.model';
import { TimeSheetEntryService } from '../service/time-sheet-entry.service';

@Component({
  templateUrl: './time-sheet-entry-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class TimeSheetEntryDeleteDialogComponent {
  timeSheetEntry?: ITimeSheetEntry;

  protected timeSheetEntryService = inject(TimeSheetEntryService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.timeSheetEntryService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
