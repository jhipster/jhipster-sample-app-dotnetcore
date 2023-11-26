import { ILocation, NewLocation } from './location.model';

export const sampleWithRequiredData: ILocation = {
  id: 17439,
};

export const sampleWithPartialData: ILocation = {
  id: 1144,
  streetAddress: 'righteously where',
  city: 'Christiansenfort',
};

export const sampleWithFullData: ILocation = {
  id: 11123,
  streetAddress: 'while valiantly',
  postalCode: 'rudely ack furthermore',
  city: 'Wuckertshire',
  stateProvince: 'yuck',
};

export const sampleWithNewData: NewLocation = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
