export interface ICountry {
  id?: number;
  countryName?: string;
  categoryId?: number;
}

export class Country implements ICountry {
  constructor(public id?: number, public countryName?: string, public categoryId?: number) {}
}
