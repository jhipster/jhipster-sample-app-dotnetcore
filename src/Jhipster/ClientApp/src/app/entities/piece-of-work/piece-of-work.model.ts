import { IJob } from 'app/entities/job/job.model';

export interface IPieceOfWork {
  id: number;
  title?: string | null;
  description?: string | null;
  jobs?: Pick<IJob, 'id'>[] | null;
}

export type NewPieceOfWork = Omit<IPieceOfWork, 'id'> & { id: null };
