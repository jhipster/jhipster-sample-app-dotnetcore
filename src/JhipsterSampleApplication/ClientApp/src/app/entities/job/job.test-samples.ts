import { IJob, NewJob } from './job.model';

export const sampleWithRequiredData: IJob = {
  id: 7159,
};

export const sampleWithPartialData: IJob = {
  id: 14001,
  jobTitle: 'Central Marketing Director',
  maxSalary: 5010,
};

export const sampleWithFullData: IJob = {
  id: 8575,
  jobTitle: 'Internal Metrics Assistant',
  minSalary: 27956,
  maxSalary: 12551,
};

export const sampleWithNewData: NewJob = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
