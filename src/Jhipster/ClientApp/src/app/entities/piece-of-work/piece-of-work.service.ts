import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';
import { IPieceOfWork } from 'app/shared/model/piece-of-work.model';

type EntityResponseType = HttpResponse<IPieceOfWork>;
type EntityArrayResponseType = HttpResponse<IPieceOfWork[]>;

@Injectable({ providedIn: 'root' })
export class PieceOfWorkService {
  public resourceUrl = SERVER_API_URL + 'api/piece-of-works';

  constructor(protected http: HttpClient) {}

  create(pieceOfWork: IPieceOfWork): Observable<EntityResponseType> {
    return this.http.post<IPieceOfWork>(this.resourceUrl, pieceOfWork, { observe: 'response' });
  }

  update(pieceOfWork: IPieceOfWork): Observable<EntityResponseType> {
    return this.http.put<IPieceOfWork>(this.resourceUrl, pieceOfWork, { observe: 'response' });
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
}
