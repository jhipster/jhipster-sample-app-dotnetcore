import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ITimeSheet } from 'app/entities/time-sheet/time-sheet.model';
import { TimeSheetService } from 'app/entities/time-sheet/service/time-sheet.service';
import { ITimeSheetEntry } from '../time-sheet-entry.model';
import { TimeSheetEntryService } from '../service/time-sheet-entry.service';
import { TimeSheetEntryFormGroup, TimeSheetEntryFormService } from './time-sheet-entry-form.service';

@Component({
  selector: 'jhi-time-sheet-entry-update',
  templateUrl: './time-sheet-entry-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TimeSheetEntryUpdateComponent implements OnInit {
  isSaving = false;
  timeSheetEntry: ITimeSheetEntry | null = null;

  timeSheetsSharedCollection: ITimeSheet[] = [];

  protected timeSheetEntryService = inject(TimeSheetEntryService);
  protected timeSheetEntryFormService = inject(TimeSheetEntryFormService);
  protected timeSheetService = inject(TimeSheetService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TimeSheetEntryFormGroup = this.timeSheetEntryFormService.createTimeSheetEntryFormGroup();

  compareTimeSheet = (o1: ITimeSheet | null, o2: ITimeSheet | null): boolean => this.timeSheetService.compareTimeSheet(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ timeSheetEntry }) => {
      this.timeSheetEntry = timeSheetEntry;
      if (timeSheetEntry) {
        this.updateForm(timeSheetEntry);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const timeSheetEntry = this.timeSheetEntryFormService.getTimeSheetEntry(this.editForm);
    if (timeSheetEntry.id !== null) {
      this.subscribeToSaveResponse(this.timeSheetEntryService.update(timeSheetEntry));
    } else {
      this.subscribeToSaveResponse(this.timeSheetEntryService.create(timeSheetEntry));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITimeSheetEntry>>): void {
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

  protected updateForm(timeSheetEntry: ITimeSheetEntry): void {
    this.timeSheetEntry = timeSheetEntry;
    this.timeSheetEntryFormService.resetForm(this.editForm, timeSheetEntry);

    this.timeSheetsSharedCollection = this.timeSheetService.addTimeSheetToCollectionIfMissing<ITimeSheet>(
      this.timeSheetsSharedCollection,
      timeSheetEntry.timeSheet,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.timeSheetService
      .query()
      .pipe(map((res: HttpResponse<ITimeSheet[]>) => res.body ?? []))
      .pipe(
        map((timeSheets: ITimeSheet[]) =>
          this.timeSheetService.addTimeSheetToCollectionIfMissing<ITimeSheet>(timeSheets, this.timeSheetEntry?.timeSheet),
        ),
      )
      .subscribe((timeSheets: ITimeSheet[]) => (this.timeSheetsSharedCollection = timeSheets));
  }
}
