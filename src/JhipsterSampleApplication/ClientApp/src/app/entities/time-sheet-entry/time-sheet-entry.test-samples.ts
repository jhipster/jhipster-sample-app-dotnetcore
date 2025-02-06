import { ITimeSheetEntry, NewTimeSheetEntry } from './time-sheet-entry.model';

export const sampleWithRequiredData: ITimeSheetEntry = {
  id: 27903,
};

export const sampleWithPartialData: ITimeSheetEntry = {
  id: 28535,
  startTimeMilitary: 28528,
};

export const sampleWithFullData: ITimeSheetEntry = {
  id: 1299,
  activityName: 'experienced',
  startTimeMilitary: 7449,
  endTimeMilitary: 20014,
  totalTime: 14175.7,
};

export const sampleWithNewData: NewTimeSheetEntry = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
