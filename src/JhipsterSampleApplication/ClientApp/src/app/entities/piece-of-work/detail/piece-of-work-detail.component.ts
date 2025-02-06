import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IPieceOfWork } from '../piece-of-work.model';

@Component({
  selector: 'jhi-piece-of-work-detail',
  templateUrl: './piece-of-work-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class PieceOfWorkDetailComponent {
  pieceOfWork = input<IPieceOfWork | null>(null);

  previousState(): void {
    window.history.back();
  }
}
