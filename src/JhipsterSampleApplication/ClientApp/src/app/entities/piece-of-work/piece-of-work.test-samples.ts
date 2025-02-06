import { IPieceOfWork, NewPieceOfWork } from './piece-of-work.model';

export const sampleWithRequiredData: IPieceOfWork = {
  id: 6729,
};

export const sampleWithPartialData: IPieceOfWork = {
  id: 15226,
  title: 'ah aw',
  description: 'or',
};

export const sampleWithFullData: IPieceOfWork = {
  id: 2926,
  title: 'per',
  description: 'table gloss',
};

export const sampleWithNewData: NewPieceOfWork = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
