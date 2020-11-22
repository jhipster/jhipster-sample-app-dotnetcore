import { IJob } from 'app/shared/model/job.model';

export interface IPieceOfWork {
  id?: number;
  title?: string;
  description?: string;
  jobs?: IJob[];
}

export class PieceOfWork implements IPieceOfWork {
  constructor(public id?: number, public title?: string, public description?: string, public jobs?: IJob[]) {}
}
