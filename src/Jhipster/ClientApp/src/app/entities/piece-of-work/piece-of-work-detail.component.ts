import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IPieceOfWork } from 'app/shared/model/piece-of-work.model';

@Component({
  selector: 'jhi-piece-of-work-detail',
  templateUrl: './piece-of-work-detail.component.html',
})
export class PieceOfWorkDetailComponent implements OnInit {
  pieceOfWork: IPieceOfWork | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ pieceOfWork }) => (this.pieceOfWork = pieceOfWork));
  }

  previousState(): void {
    window.history.back();
  }
}
