import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe } from 'app/shared/date';
import { IPieceOfWork } from '../piece-of-work.model';

@Component({
  standalone: true,
  selector: 'jhi-piece-of-work-detail',
  templateUrl: './piece-of-work-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class PieceOfWorkDetailComponent {
  @Input() pieceOfWork: IPieceOfWork | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  previousState(): void {
    window.history.back();
  }
}
