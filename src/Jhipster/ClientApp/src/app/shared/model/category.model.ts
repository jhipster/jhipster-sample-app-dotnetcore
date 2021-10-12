export interface ICategory {
  id?: number;
  categoryName?: string;
  selected?: boolean;
  notCategorized?: boolean;
}

export class Category implements ICategory {
  constructor(public id?: number, public categoryName?: string, public selected?: boolean) {}
}
