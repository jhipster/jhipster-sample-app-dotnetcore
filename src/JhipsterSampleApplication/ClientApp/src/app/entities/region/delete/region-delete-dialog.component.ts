import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IRegion } from '../region.model';
import { RegionService } from '../service/region.service';

@Component({
  templateUrl: './region-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class RegionDeleteDialogComponent {
  region?: IRegion;

  protected regionService = inject(RegionService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.regionService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
