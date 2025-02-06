import { ILocation, NewLocation } from './location.model';

export const sampleWithRequiredData: ILocation = {
  id: 12482,
};

export const sampleWithPartialData: ILocation = {
  id: 30179,
  postalCode: 'wallaby',
  city: 'Amirview',
};

export const sampleWithFullData: ILocation = {
  id: 22007,
  streetAddress: 'abseil given',
  postalCode: 'underneath emerge excluding',
  city: 'Port Peyton',
  stateProvince: 'sweet cemetery quickly',
};

export const sampleWithNewData: NewLocation = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
