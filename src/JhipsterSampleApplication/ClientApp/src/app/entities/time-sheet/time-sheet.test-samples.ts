import dayjs from 'dayjs/esm';

import { ITimeSheet, NewTimeSheet } from './time-sheet.model';

export const sampleWithRequiredData: ITimeSheet = {
  id: 'f9bcd586-1a81-4ed5-88d8-a27fa7ac3314',
};

export const sampleWithPartialData: ITimeSheet = {
  id: 'e01530ee-d91f-4610-9f4b-72ed7df70100',
  timeSheetDate: dayjs('2025-02-06'),
};

export const sampleWithFullData: ITimeSheet = {
  id: 'ee3fecaa-ab34-4069-8db3-da2d04c9d9bc',
  timeSheetDate: dayjs('2025-02-06'),
};

export const sampleWithNewData: NewTimeSheet = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
