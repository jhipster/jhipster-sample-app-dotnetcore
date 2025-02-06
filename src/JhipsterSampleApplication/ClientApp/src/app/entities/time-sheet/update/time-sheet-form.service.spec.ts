import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../time-sheet.test-samples';

import { TimeSheetFormService } from './time-sheet-form.service';

describe('TimeSheet Form Service', () => {
  let service: TimeSheetFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeSheetFormService);
  });

  describe('Service methods', () => {
    describe('createTimeSheetFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTimeSheetFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            timeSheetDate: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });

      it('passing ITimeSheet should create a new form with FormGroup', () => {
        const formGroup = service.createTimeSheetFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            timeSheetDate: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });
    });

    describe('getTimeSheet', () => {
      it('should return NewTimeSheet for default TimeSheet initial value', () => {
        const formGroup = service.createTimeSheetFormGroup(sampleWithNewData);

        const timeSheet = service.getTimeSheet(formGroup) as any;

        expect(timeSheet).toMatchObject(sampleWithNewData);
      });

      it('should return NewTimeSheet for empty TimeSheet initial value', () => {
        const formGroup = service.createTimeSheetFormGroup();

        const timeSheet = service.getTimeSheet(formGroup) as any;

        expect(timeSheet).toMatchObject({});
      });

      it('should return ITimeSheet', () => {
        const formGroup = service.createTimeSheetFormGroup(sampleWithRequiredData);

        const timeSheet = service.getTimeSheet(formGroup) as any;

        expect(timeSheet).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITimeSheet should not enable id FormControl', () => {
        const formGroup = service.createTimeSheetFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTimeSheet should disable id FormControl', () => {
        const formGroup = service.createTimeSheetFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
