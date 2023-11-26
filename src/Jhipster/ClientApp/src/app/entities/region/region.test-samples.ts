import { IRegion, NewRegion } from './region.model';

export const sampleWithRequiredData: IRegion = {
  id: 13082,
};

export const sampleWithPartialData: IRegion = {
  id: 23323,
};

export const sampleWithFullData: IRegion = {
  id: 562,
  regionName: 'lest',
};

export const sampleWithNewData: NewRegion = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
