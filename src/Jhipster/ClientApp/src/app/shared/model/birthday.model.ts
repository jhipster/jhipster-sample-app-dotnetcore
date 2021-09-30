import { Moment } from 'moment';

export interface IBirthday {
  id?: number;
  lname?: string;
  fname?: string;
  sign?: string;
  dob?: Moment;
  categories?: string[];
}

export class Birthday implements IBirthday {
  constructor(
    public id?: number,
    public lname?: string,
    public fname?: string,
    public sign?: string,
    public dob?: Moment,
    public categories? : string[]
  ) {}
}
