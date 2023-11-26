import { IPieceOfWork, NewPieceOfWork } from './piece-of-work.model';

export const sampleWithRequiredData: IPieceOfWork = {
  id: 9335,
};

export const sampleWithPartialData: IPieceOfWork = {
  id: 29792,
  title: 'swift shift identical',
};

export const sampleWithFullData: IPieceOfWork = {
  id: 5952,
  title: 'which spherical',
  description: 'supposing mechanic towards',
};

export const sampleWithNewData: NewPieceOfWork = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
