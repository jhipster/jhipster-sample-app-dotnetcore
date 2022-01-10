import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';
import { IRuleset } from 'app/shared/model/ruleset.model';

type EntityResponseType = HttpResponse<IRuleset>;
type EntityArrayResponseType = HttpResponse<IRuleset[]>;

@Injectable({ providedIn: 'root' })
export class RulesetService {
  public resourceUrl = SERVER_API_URL + 'api/ruleset';

  constructor(protected http: HttpClient) {}

  create(ruleset: IRuleset): Observable<EntityResponseType> {
    return this.http.post<IRuleset>(this.resourceUrl, ruleset, { observe: 'response' });
  }

  update(ruleset: IRuleset): Observable<EntityResponseType> {
    return this.http.put<IRuleset>(this.resourceUrl, ruleset, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IRuleset>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IRuleset[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }
}
