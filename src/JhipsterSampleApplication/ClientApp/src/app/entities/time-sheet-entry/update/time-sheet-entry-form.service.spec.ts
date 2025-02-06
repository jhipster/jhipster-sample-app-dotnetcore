import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../time-sheet-entry.test-samples';

import { TimeSheetEntryFormService } from './time-sheet-entry-form.service';

describe('TimeSheetEntry Form Service', () => {
  let service: TimeSheetEntryFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeSheetEntryFormService);
  });

  describe('Service methods', () => {
    describe('createTimeSheetEntryFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTimeSheetEntryFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            activityName: expect.any(Object),
            startTimeMilitary: expect.any(Object),
            endTimeMilitary: expect.any(Object),
            totalTime: expect.any(Object),
            timeSheet: expect.any(Object),
          }),
        );
      });

      it('passing ITimeSheetEntry should create a new form with FormGroup', () => {
        const formGroup = service.createTimeSheetEntryFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            activityName: expect.any(Object),
            startTimeMilitary: expect.any(Object),
            endTimeMilitary: expect.any(Object),
            totalTime: expect.any(Object),
            timeSheet: expect.any(Object),
          }),
        );
      });
    });

    describe('getTimeSheetEntry', () => {
      it('should return NewTimeSheetEntry for default TimeSheetEntry initial value', () => {
        const formGroup = service.createTimeSheetEntryFormGroup(sampleWithNewData);

        const timeSheetEntry = service.getTimeSheetEntry(formGroup) as any;

        expect(timeSheetEntry).toMatchObject(sampleWithNewData);
      });

      it('should return NewTimeSheetEntry for empty TimeSheetEntry initial value', () => {
        const formGroup = service.createTimeSheetEntryFormGroup();

        const timeSheetEntry = service.getTimeSheetEntry(formGroup) as any;

        expect(timeSheetEntry).toMatchObject({});
      });

      it('should return ITimeSheetEntry', () => {
        const formGroup = service.createTimeSheetEntryFormGroup(sampleWithRequiredData);

        const timeSheetEntry = service.getTimeSheetEntry(formGroup) as any;

        expect(timeSheetEntry).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITimeSheetEntry should not enable id FormControl', () => {
        const formGroup = service.createTimeSheetEntryFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTimeSheetEntry should disable id FormControl', () => {
        const formGroup = service.createTimeSheetEntryFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
