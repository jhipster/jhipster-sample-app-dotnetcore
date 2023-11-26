import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IPieceOfWork } from '../piece-of-work.model';
import { PieceOfWorkService } from '../service/piece-of-work.service';

@Component({
  standalone: true,
  templateUrl: './piece-of-work-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class PieceOfWorkDeleteDialogComponent {
  pieceOfWork?: IPieceOfWork;

  constructor(
    protected pieceOfWorkService: PieceOfWorkService,
    protected activeModal: NgbActiveModal,
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.pieceOfWorkService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
