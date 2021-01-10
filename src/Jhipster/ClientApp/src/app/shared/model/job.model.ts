import { IPieceOfWork } from 'app/shared/model/piece-of-work.model';

export interface IJob {
  id?: number;
  jobTitle?: string;
  minSalary?: number;
  maxSalary?: number;
  chores?: IPieceOfWork[];
  employeeId?: number;
}

export class Job implements IJob {
  constructor(
    public id?: number,
    public jobTitle?: string,
    public minSalary?: number,
    public maxSalary?: number,
    public chores?: IPieceOfWork[],
    public employeeId?: number
  ) {}
}
