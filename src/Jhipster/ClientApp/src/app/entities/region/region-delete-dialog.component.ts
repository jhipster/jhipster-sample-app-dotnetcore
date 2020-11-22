import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IRegion } from 'app/shared/model/region.model';
import { RegionService } from './region.service';

@Component({
  templateUrl: './region-delete-dialog.component.html',
})
export class RegionDeleteDialogComponent {
  region?: IRegion;

  constructor(protected regionService: RegionService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.regionService.delete(id).subscribe(() => {
      this.eventManager.broadcast('regionListModification');
      this.activeModal.close();
    });
  }
}
