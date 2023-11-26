import { ICountry, NewCountry } from './country.model';

export const sampleWithRequiredData: ICountry = {
  id: 28089,
};

export const sampleWithPartialData: ICountry = {
  id: 14806,
  countryName: 'hopelessly responsible ugh',
};

export const sampleWithFullData: ICountry = {
  id: 12577,
  countryName: 'firm',
};

export const sampleWithNewData: NewCountry = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
