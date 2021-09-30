import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { IBirthday, Birthday } from 'app/shared/model/birthday.model';
import { BirthdayService } from './birthday.service';

@Component({
  selector: 'jhi-birthday-update',
  templateUrl: './birthday-update.component.html',
})
export class BirthdayUpdateComponent implements OnInit {
  isSaving = false;
  dobDp: any;

  editForm = this.fb.group({
    id: [],
    lname: [],
    fname: [],
    dob: [],
    isAlive: [],
    optional: [],
  });

  constructor(protected birthdayService: BirthdayService, protected activatedRoute: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ birthday }) => {
      this.updateForm(birthday);
    });
  }

  updateForm(birthday: IBirthday): void {
    this.editForm.patchValue({
      id: birthday.id,
      lname: birthday.lname,
      fname: birthday.fname,
      dob: birthday.dob,
      isAlive: birthday.isAlive,
      optional: birthday.optional,
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const birthday = this.createFromForm();
    if (birthday.id !== undefined) {
      this.subscribeToSaveResponse(this.birthdayService.update(birthday));
    } else {
      this.subscribeToSaveResponse(this.birthdayService.create(birthday));
    }
  }

  private createFromForm(): IBirthday {
    return {
      ...new Birthday(),
      id: this.editForm.get(['id'])!.value,
      lname: this.editForm.get(['lname'])!.value,
      fname: this.editForm.get(['fname'])!.value,
      dob: this.editForm.get(['dob'])!.value,
      isAlive: this.editForm.get(['isAlive'])!.value,
      optional: this.editForm.get(['optional'])!.value,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IBirthday>>): void {
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
