export interface ICategory {
  id?: number;
  categoryName?: string;
  selected?: boolean;
}

export class Category implements ICategory {
  constructor(public id?: number, public categoryName?: string, public selected?: boolean) {}
}
