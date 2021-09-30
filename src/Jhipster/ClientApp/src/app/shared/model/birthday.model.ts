import { Moment } from 'moment';

export interface IBirthday {
  id?: number;
  lname?: string;
  fname?: string;
  dob?: Moment;
  isAlive?: boolean;
  optional?: string;
}

export class Birthday implements IBirthday {
  constructor(
    public id?: number,
    public lname?: string,
    public fname?: string,
    public dob?: Moment,
    public isAlive?: boolean,
    public optional?: string
  ) {
    this.isAlive = this.isAlive || false;
  }
}
