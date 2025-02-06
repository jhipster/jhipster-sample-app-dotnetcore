import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../job.test-samples';

import { JobFormService } from './job-form.service';

describe('Job Form Service', () => {
  let service: JobFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobFormService);
  });

  describe('Service methods', () => {
    describe('createJobFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createJobFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            jobTitle: expect.any(Object),
            minSalary: expect.any(Object),
            maxSalary: expect.any(Object),
            chores: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });

      it('passing IJob should create a new form with FormGroup', () => {
        const formGroup = service.createJobFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            jobTitle: expect.any(Object),
            minSalary: expect.any(Object),
            maxSalary: expect.any(Object),
            chores: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });
    });

    describe('getJob', () => {
      it('should return NewJob for default Job initial value', () => {
        const formGroup = service.createJobFormGroup(sampleWithNewData);

        const job = service.getJob(formGroup) as any;

        expect(job).toMatchObject(sampleWithNewData);
      });

      it('should return NewJob for empty Job initial value', () => {
        const formGroup = service.createJobFormGroup();

        const job = service.getJob(formGroup) as any;

        expect(job).toMatchObject({});
      });

      it('should return IJob', () => {
        const formGroup = service.createJobFormGroup(sampleWithRequiredData);

        const job = service.getJob(formGroup) as any;

        expect(job).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IJob should not enable id FormControl', () => {
        const formGroup = service.createJobFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewJob should disable id FormControl', () => {
        const formGroup = service.createJobFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
