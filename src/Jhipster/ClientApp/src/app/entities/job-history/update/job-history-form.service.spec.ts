import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../job-history.test-samples';

import { JobHistoryFormService } from './job-history-form.service';

describe('JobHistory Form Service', () => {
  let service: JobHistoryFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobHistoryFormService);
  });

  describe('Service methods', () => {
    describe('createJobHistoryFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createJobHistoryFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            language: expect.any(Object),
            job: expect.any(Object),
            department: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });

      it('passing IJobHistory should create a new form with FormGroup', () => {
        const formGroup = service.createJobHistoryFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            language: expect.any(Object),
            job: expect.any(Object),
            department: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });
    });

    describe('getJobHistory', () => {
      it('should return NewJobHistory for default JobHistory initial value', () => {
        const formGroup = service.createJobHistoryFormGroup(sampleWithNewData);

        const jobHistory = service.getJobHistory(formGroup) as any;

        expect(jobHistory).toMatchObject(sampleWithNewData);
      });

      it('should return NewJobHistory for empty JobHistory initial value', () => {
        const formGroup = service.createJobHistoryFormGroup();

        const jobHistory = service.getJobHistory(formGroup) as any;

        expect(jobHistory).toMatchObject({});
      });

      it('should return IJobHistory', () => {
        const formGroup = service.createJobHistoryFormGroup(sampleWithRequiredData);

        const jobHistory = service.getJobHistory(formGroup) as any;

        expect(jobHistory).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IJobHistory should not enable id FormControl', () => {
        const formGroup = service.createJobHistoryFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewJobHistory should disable id FormControl', () => {
        const formGroup = service.createJobHistoryFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
