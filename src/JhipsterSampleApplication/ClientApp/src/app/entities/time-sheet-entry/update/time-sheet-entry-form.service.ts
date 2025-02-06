import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ITimeSheetEntry, NewTimeSheetEntry } from '../time-sheet-entry.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITimeSheetEntry for edit and NewTimeSheetEntryFormGroupInput for create.
 */
type TimeSheetEntryFormGroupInput = ITimeSheetEntry | PartialWithRequiredKeyOf<NewTimeSheetEntry>;

type TimeSheetEntryFormDefaults = Pick<NewTimeSheetEntry, 'id'>;

type TimeSheetEntryFormGroupContent = {
  id: FormControl<ITimeSheetEntry['id'] | NewTimeSheetEntry['id']>;
  activityName: FormControl<ITimeSheetEntry['activityName']>;
  startTimeMilitary: FormControl<ITimeSheetEntry['startTimeMilitary']>;
  endTimeMilitary: FormControl<ITimeSheetEntry['endTimeMilitary']>;
  totalTime: FormControl<ITimeSheetEntry['totalTime']>;
  timeSheet: FormControl<ITimeSheetEntry['timeSheet']>;
};

export type TimeSheetEntryFormGroup = FormGroup<TimeSheetEntryFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TimeSheetEntryFormService {
  createTimeSheetEntryFormGroup(timeSheetEntry: TimeSheetEntryFormGroupInput = { id: null }): TimeSheetEntryFormGroup {
    const timeSheetEntryRawValue = {
      ...this.getFormDefaults(),
      ...timeSheetEntry,
    };
    return new FormGroup<TimeSheetEntryFormGroupContent>({
      id: new FormControl(
        { value: timeSheetEntryRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      activityName: new FormControl(timeSheetEntryRawValue.activityName),
      startTimeMilitary: new FormControl(timeSheetEntryRawValue.startTimeMilitary),
      endTimeMilitary: new FormControl(timeSheetEntryRawValue.endTimeMilitary),
      totalTime: new FormControl(timeSheetEntryRawValue.totalTime),
      timeSheet: new FormControl(timeSheetEntryRawValue.timeSheet),
    });
  }

  getTimeSheetEntry(form: TimeSheetEntryFormGroup): ITimeSheetEntry | NewTimeSheetEntry {
    return form.getRawValue() as ITimeSheetEntry | NewTimeSheetEntry;
  }

  resetForm(form: TimeSheetEntryFormGroup, timeSheetEntry: TimeSheetEntryFormGroupInput): void {
    const timeSheetEntryRawValue = { ...this.getFormDefaults(), ...timeSheetEntry };
    form.reset(
      {
        ...timeSheetEntryRawValue,
        id: { value: timeSheetEntryRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TimeSheetEntryFormDefaults {
    return {
      id: null,
    };
  }
}
