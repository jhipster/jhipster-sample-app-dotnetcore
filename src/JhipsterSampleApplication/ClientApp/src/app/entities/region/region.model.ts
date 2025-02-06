export interface IRegion {
  id: number;
  regionName?: string | null;
}

export type NewRegion = Omit<IRegion, 'id'> & { id: null };
