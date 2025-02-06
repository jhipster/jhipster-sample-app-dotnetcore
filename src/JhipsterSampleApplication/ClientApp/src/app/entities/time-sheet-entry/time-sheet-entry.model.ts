import { ITimeSheet } from 'app/entities/time-sheet/time-sheet.model';

export interface ITimeSheetEntry {
  id: number;
  activityName?: string | null;
  startTimeMilitary?: number | null;
  endTimeMilitary?: number | null;
  totalTime?: number | null;
  timeSheet?: Pick<ITimeSheet, 'id'> | null;
}

export type NewTimeSheetEntry = Omit<ITimeSheetEntry, 'id'> & { id: null };
