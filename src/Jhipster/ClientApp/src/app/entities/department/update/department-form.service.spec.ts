import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../department.test-samples';

import { DepartmentFormService } from './department-form.service';

describe('Department Form Service', () => {
  let service: DepartmentFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepartmentFormService);
  });

  describe('Service methods', () => {
    describe('createDepartmentFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createDepartmentFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            departmentName: expect.any(Object),
            location: expect.any(Object),
          }),
        );
      });

      it('passing IDepartment should create a new form with FormGroup', () => {
        const formGroup = service.createDepartmentFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            departmentName: expect.any(Object),
            location: expect.any(Object),
          }),
        );
      });
    });

    describe('getDepartment', () => {
      it('should return NewDepartment for default Department initial value', () => {
        const formGroup = service.createDepartmentFormGroup(sampleWithNewData);

        const department = service.getDepartment(formGroup) as any;

        expect(department).toMatchObject(sampleWithNewData);
      });

      it('should return NewDepartment for empty Department initial value', () => {
        const formGroup = service.createDepartmentFormGroup();

        const department = service.getDepartment(formGroup) as any;

        expect(department).toMatchObject({});
      });

      it('should return IDepartment', () => {
        const formGroup = service.createDepartmentFormGroup(sampleWithRequiredData);

        const department = service.getDepartment(formGroup) as any;

        expect(department).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IDepartment should not enable id FormControl', () => {
        const formGroup = service.createDepartmentFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewDepartment should disable id FormControl', () => {
        const formGroup = service.createDepartmentFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
