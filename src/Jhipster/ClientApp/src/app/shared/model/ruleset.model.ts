export interface IRuleset {
  id?: number;
  name?: string;
  jsonString?: string;
}

export class Ruleset implements IRuleset {
  constructor(public id?: number, public name?: string, public jsonString?: string) {}
}
