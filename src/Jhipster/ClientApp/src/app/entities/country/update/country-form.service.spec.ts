import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../country.test-samples';

import { CountryFormService } from './country-form.service';

describe('Country Form Service', () => {
  let service: CountryFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CountryFormService);
  });

  describe('Service methods', () => {
    describe('createCountryFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createCountryFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            countryName: expect.any(Object),
            region: expect.any(Object),
          }),
        );
      });

      it('passing ICountry should create a new form with FormGroup', () => {
        const formGroup = service.createCountryFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            countryName: expect.any(Object),
            region: expect.any(Object),
          }),
        );
      });
    });

    describe('getCountry', () => {
      it('should return NewCountry for default Country initial value', () => {
        const formGroup = service.createCountryFormGroup(sampleWithNewData);

        const country = service.getCountry(formGroup) as any;

        expect(country).toMatchObject(sampleWithNewData);
      });

      it('should return NewCountry for empty Country initial value', () => {
        const formGroup = service.createCountryFormGroup();

        const country = service.getCountry(formGroup) as any;

        expect(country).toMatchObject({});
      });

      it('should return ICountry', () => {
        const formGroup = service.createCountryFormGroup(sampleWithRequiredData);

        const country = service.getCountry(formGroup) as any;

        expect(country).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ICountry should not enable id FormControl', () => {
        const formGroup = service.createCountryFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewCountry should disable id FormControl', () => {
        const formGroup = service.createCountryFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
