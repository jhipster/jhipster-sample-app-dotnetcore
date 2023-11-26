import { IJob, NewJob } from './job.model';

export const sampleWithRequiredData: IJob = {
  id: 21197,
};

export const sampleWithPartialData: IJob = {
  id: 31420,
  minSalary: 16250,
  maxSalary: 3821,
};

export const sampleWithFullData: IJob = {
  id: 27511,
  jobTitle: 'International Usability Orchestrator',
  minSalary: 27844,
  maxSalary: 4701,
};

export const sampleWithNewData: NewJob = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
