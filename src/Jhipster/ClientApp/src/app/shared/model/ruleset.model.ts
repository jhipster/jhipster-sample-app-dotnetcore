export interface IStoredRuleset {
  id?: number;
  name?: string;
  jsonString?: string;
}

export class StoredRuleset implements IStoredRuleset {
  constructor(public id?: number, public name?: string, public jsonString?: string) {}
}
