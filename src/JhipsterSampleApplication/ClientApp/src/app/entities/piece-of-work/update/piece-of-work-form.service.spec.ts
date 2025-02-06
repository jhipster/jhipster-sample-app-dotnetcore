import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../piece-of-work.test-samples';

import { PieceOfWorkFormService } from './piece-of-work-form.service';

describe('PieceOfWork Form Service', () => {
  let service: PieceOfWorkFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PieceOfWorkFormService);
  });

  describe('Service methods', () => {
    describe('createPieceOfWorkFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPieceOfWorkFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            description: expect.any(Object),
          }),
        );
      });

      it('passing IPieceOfWork should create a new form with FormGroup', () => {
        const formGroup = service.createPieceOfWorkFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            description: expect.any(Object),
          }),
        );
      });
    });

    describe('getPieceOfWork', () => {
      it('should return NewPieceOfWork for default PieceOfWork initial value', () => {
        const formGroup = service.createPieceOfWorkFormGroup(sampleWithNewData);

        const pieceOfWork = service.getPieceOfWork(formGroup) as any;

        expect(pieceOfWork).toMatchObject(sampleWithNewData);
      });

      it('should return NewPieceOfWork for empty PieceOfWork initial value', () => {
        const formGroup = service.createPieceOfWorkFormGroup();

        const pieceOfWork = service.getPieceOfWork(formGroup) as any;

        expect(pieceOfWork).toMatchObject({});
      });

      it('should return IPieceOfWork', () => {
        const formGroup = service.createPieceOfWorkFormGroup(sampleWithRequiredData);

        const pieceOfWork = service.getPieceOfWork(formGroup) as any;

        expect(pieceOfWork).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPieceOfWork should not enable id FormControl', () => {
        const formGroup = service.createPieceOfWorkFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPieceOfWork should disable id FormControl', () => {
        const formGroup = service.createPieceOfWorkFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
