import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { IPieceOfWork, PieceOfWork } from 'app/shared/model/piece-of-work.model';
import { PieceOfWorkService } from './piece-of-work.service';

@Component({
  selector: 'jhi-piece-of-work-update',
  templateUrl: './piece-of-work-update.component.html',
})
export class PieceOfWorkUpdateComponent implements OnInit {
  isSaving = false;

  editForm = this.fb.group({
    id: [],
    title: [],
    description: [],
  });

  constructor(protected pieceOfWorkService: PieceOfWorkService, protected activatedRoute: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ pieceOfWork }) => {
      this.updateForm(pieceOfWork);
    });
  }

  updateForm(pieceOfWork: IPieceOfWork): void {
    this.editForm.patchValue({
      id: pieceOfWork.id,
      title: pieceOfWork.title,
      description: pieceOfWork.description,
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const pieceOfWork = this.createFromForm();
    if (pieceOfWork.id !== undefined) {
      this.subscribeToSaveResponse(this.pieceOfWorkService.update(pieceOfWork));
    } else {
      this.subscribeToSaveResponse(this.pieceOfWorkService.create(pieceOfWork));
    }
  }

  private createFromForm(): IPieceOfWork {
    return {
      ...new PieceOfWork(),
      id: this.editForm.get(['id'])!.value,
      title: this.editForm.get(['title'])!.value,
      description: this.editForm.get(['description'])!.value,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPieceOfWork>>): void {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }
}
