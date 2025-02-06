import { IRegion, NewRegion } from './region.model';

export const sampleWithRequiredData: IRegion = {
  id: 20776,
};

export const sampleWithPartialData: IRegion = {
  id: 31967,
  regionName: 'till grade',
};

export const sampleWithFullData: IRegion = {
  id: 32233,
  regionName: 'a',
};

export const sampleWithNewData: NewRegion = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
