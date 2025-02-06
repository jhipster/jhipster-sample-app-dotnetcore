import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ITimeSheet, NewTimeSheet } from '../time-sheet.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITimeSheet for edit and NewTimeSheetFormGroupInput for create.
 */
type TimeSheetFormGroupInput = ITimeSheet | PartialWithRequiredKeyOf<NewTimeSheet>;

type TimeSheetFormDefaults = Pick<NewTimeSheet, 'id'>;

type TimeSheetFormGroupContent = {
  id: FormControl<ITimeSheet['id'] | NewTimeSheet['id']>;
  timeSheetDate: FormControl<ITimeSheet['timeSheetDate']>;
  employee: FormControl<ITimeSheet['employee']>;
};

export type TimeSheetFormGroup = FormGroup<TimeSheetFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TimeSheetFormService {
  createTimeSheetFormGroup(timeSheet: TimeSheetFormGroupInput = { id: null }): TimeSheetFormGroup {
    const timeSheetRawValue = {
      ...this.getFormDefaults(),
      ...timeSheet,
    };
    return new FormGroup<TimeSheetFormGroupContent>({
      id: new FormControl(
        { value: timeSheetRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      timeSheetDate: new FormControl(timeSheetRawValue.timeSheetDate),
      employee: new FormControl(timeSheetRawValue.employee),
    });
  }

  getTimeSheet(form: TimeSheetFormGroup): ITimeSheet | NewTimeSheet {
    return form.getRawValue() as ITimeSheet | NewTimeSheet;
  }

  resetForm(form: TimeSheetFormGroup, timeSheet: TimeSheetFormGroupInput): void {
    const timeSheetRawValue = { ...this.getFormDefaults(), ...timeSheet };
    form.reset(
      {
        ...timeSheetRawValue,
        id: { value: timeSheetRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TimeSheetFormDefaults {
    return {
      id: null,
    };
  }
}
