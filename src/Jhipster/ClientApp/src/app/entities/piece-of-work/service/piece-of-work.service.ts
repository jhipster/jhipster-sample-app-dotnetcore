import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPieceOfWork, NewPieceOfWork } from '../piece-of-work.model';

export type PartialUpdatePieceOfWork = Partial<IPieceOfWork> & Pick<IPieceOfWork, 'id'>;

export type EntityResponseType = HttpResponse<IPieceOfWork>;
export type EntityArrayResponseType = HttpResponse<IPieceOfWork[]>;

@Injectable({ providedIn: 'root' })
export class PieceOfWorkService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/piece-of-works');

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
  ) {}

  create(pieceOfWork: NewPieceOfWork): Observable<EntityResponseType> {
    return this.http.post<IPieceOfWork>(this.resourceUrl, pieceOfWork, { observe: 'response' });
  }

  update(pieceOfWork: IPieceOfWork): Observable<EntityResponseType> {
    return this.http.put<IPieceOfWork>(`${this.resourceUrl}/${this.getPieceOfWorkIdentifier(pieceOfWork)}`, pieceOfWork, {
      observe: 'response',
    });
  }

  partialUpdate(pieceOfWork: PartialUpdatePieceOfWork): Observable<EntityResponseType> {
    return this.http.patch<IPieceOfWork>(`${this.resourceUrl}/${this.getPieceOfWorkIdentifier(pieceOfWork)}`, pieceOfWork, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IPieceOfWork>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPieceOfWork[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPieceOfWorkIdentifier(pieceOfWork: Pick<IPieceOfWork, 'id'>): number {
    return pieceOfWork.id;
  }

  comparePieceOfWork(o1: Pick<IPieceOfWork, 'id'> | null, o2: Pick<IPieceOfWork, 'id'> | null): boolean {
    return o1 && o2 ? this.getPieceOfWorkIdentifier(o1) === this.getPieceOfWorkIdentifier(o2) : o1 === o2;
  }

  addPieceOfWorkToCollectionIfMissing<Type extends Pick<IPieceOfWork, 'id'>>(
    pieceOfWorkCollection: Type[],
    ...pieceOfWorksToCheck: (Type | null | undefined)[]
  ): Type[] {
    const pieceOfWorks: Type[] = pieceOfWorksToCheck.filter(isPresent);
    if (pieceOfWorks.length > 0) {
      const pieceOfWorkCollectionIdentifiers = pieceOfWorkCollection.map(
        pieceOfWorkItem => this.getPieceOfWorkIdentifier(pieceOfWorkItem)!,
      );
      const pieceOfWorksToAdd = pieceOfWorks.filter(pieceOfWorkItem => {
        const pieceOfWorkIdentifier = this.getPieceOfWorkIdentifier(pieceOfWorkItem);
        if (pieceOfWorkCollectionIdentifiers.includes(pieceOfWorkIdentifier)) {
          return false;
        }
        pieceOfWorkCollectionIdentifiers.push(pieceOfWorkIdentifier);
        return true;
      });
      return [...pieceOfWorksToAdd, ...pieceOfWorkCollection];
    }
    return pieceOfWorkCollection;
  }
}
