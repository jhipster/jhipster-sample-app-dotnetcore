import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IPieceOfWork } from '../piece-of-work.model';
import { PieceOfWorkService } from '../service/piece-of-work.service';
import { PieceOfWorkFormService, PieceOfWorkFormGroup } from './piece-of-work-form.service';

@Component({
  standalone: true,
  selector: 'jhi-piece-of-work-update',
  templateUrl: './piece-of-work-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PieceOfWorkUpdateComponent implements OnInit {
  isSaving = false;
  pieceOfWork: IPieceOfWork | null = null;

  editForm: PieceOfWorkFormGroup = this.pieceOfWorkFormService.createPieceOfWorkFormGroup();

  constructor(
    protected pieceOfWorkService: PieceOfWorkService,
    protected pieceOfWorkFormService: PieceOfWorkFormService,
    protected activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ pieceOfWork }) => {
      this.pieceOfWork = pieceOfWork;
      if (pieceOfWork) {
        this.updateForm(pieceOfWork);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const pieceOfWork = this.pieceOfWorkFormService.getPieceOfWork(this.editForm);
    if (pieceOfWork.id !== null) {
      this.subscribeToSaveResponse(this.pieceOfWorkService.update(pieceOfWork));
    } else {
      this.subscribeToSaveResponse(this.pieceOfWorkService.create(pieceOfWork));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPieceOfWork>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(pieceOfWork: IPieceOfWork): void {
    this.pieceOfWork = pieceOfWork;
    this.pieceOfWorkFormService.resetForm(this.editForm, pieceOfWork);
  }
}
