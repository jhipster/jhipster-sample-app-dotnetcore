import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IPieceOfWork } from 'app/shared/model/piece-of-work.model';
import { PieceOfWorkService } from './piece-of-work.service';

@Component({
  templateUrl: './piece-of-work-delete-dialog.component.html',
})
export class PieceOfWorkDeleteDialogComponent {
  pieceOfWork?: IPieceOfWork;

  constructor(
    protected pieceOfWorkService: PieceOfWorkService,
    public activeModal: NgbActiveModal,
    protected eventManager: JhiEventManager
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.pieceOfWorkService.delete(id).subscribe(() => {
      this.eventManager.broadcast('pieceOfWorkListModification');
      this.activeModal.close();
    });
  }
}
