
export interface ICategory {
  id?: number;
  categoryName?: string;
  selected?: boolean;
  notCategorized?: boolean;
  focusType?: string;
  focusId?: string;
  jsonString?: string;
  description?: string;
}

export class Category implements ICategory {
  constructor(public id?: number, public categoryName?: string, public selected?: boolean, public focusType?: string, public focus?: string, public jsonString?: string) {}
}
