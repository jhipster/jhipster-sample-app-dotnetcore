import { ICountry } from 'app/entities/country/country.model';

export interface ILocation {
  id: number;
  streetAddress?: string | null;
  postalCode?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  country?: Pick<ICountry, 'id'> | null;
}

export type NewLocation = Omit<ILocation, 'id'> & { id: null };
