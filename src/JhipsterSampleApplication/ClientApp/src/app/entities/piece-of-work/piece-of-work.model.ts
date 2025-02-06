export interface IPieceOfWork {
  id: number;
  title?: string | null;
  description?: string | null;
}

export type NewPieceOfWork = Omit<IPieceOfWork, 'id'> & { id: null };
