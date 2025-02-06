import dayjs from 'dayjs/esm';
import { IEmployee } from 'app/entities/employee/employee.model';

export interface ITimeSheet {
  id: string;
  timeSheetDate?: dayjs.Dayjs | null;
  employee?: Pick<IEmployee, 'id'> | null;
}

export type NewTimeSheet = Omit<ITimeSheet, 'id'> & { id: null };
