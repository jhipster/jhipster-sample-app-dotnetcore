import { IPieceOfWork } from 'app/entities/piece-of-work/piece-of-work.model';
import { IEmployee } from 'app/entities/employee/employee.model';

export interface IJob {
  id: number;
  jobTitle?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  chores?: Pick<IPieceOfWork, 'id' | 'title'>[] | null;
  employee?: Pick<IEmployee, 'id'> | null;
}

export type NewJob = Omit<IJob, 'id'> & { id: null };
