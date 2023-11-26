import dayjs from 'dayjs/esm';

import { IJobHistory, NewJobHistory } from './job-history.model';

export const sampleWithRequiredData: IJobHistory = {
  id: 4141,
};

export const sampleWithPartialData: IJobHistory = {
  id: 11125,
  startDate: dayjs('2020-11-22T13:38'),
};

export const sampleWithFullData: IJobHistory = {
  id: 10426,
  startDate: dayjs('2020-11-22T01:06'),
  endDate: dayjs('2020-11-21T22:27'),
  language: 'FRENCH',
};

export const sampleWithNewData: NewJobHistory = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
