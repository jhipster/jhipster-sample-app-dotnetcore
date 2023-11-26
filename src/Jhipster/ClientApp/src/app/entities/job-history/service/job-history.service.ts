import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IJobHistory, NewJobHistory } from '../job-history.model';

export type PartialUpdateJobHistory = Partial<IJobHistory> & Pick<IJobHistory, 'id'>;

type RestOf<T extends IJobHistory | NewJobHistory> = Omit<T, 'startDate' | 'endDate'> & {
  startDate?: string | null;
  endDate?: string | null;
};

export type RestJobHistory = RestOf<IJobHistory>;

export type NewRestJobHistory = RestOf<NewJobHistory>;

export type PartialUpdateRestJobHistory = RestOf<PartialUpdateJobHistory>;

export type EntityResponseType = HttpResponse<IJobHistory>;
export type EntityArrayResponseType = HttpResponse<IJobHistory[]>;

@Injectable({ providedIn: 'root' })
export class JobHistoryService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/job-histories');

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
  ) {}

  create(jobHistory: NewJobHistory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(jobHistory);
    return this.http
      .post<RestJobHistory>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(jobHistory: IJobHistory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(jobHistory);
    return this.http
      .put<RestJobHistory>(`${this.resourceUrl}/${this.getJobHistoryIdentifier(jobHistory)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(jobHistory: PartialUpdateJobHistory): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(jobHistory);
    return this.http
      .patch<RestJobHistory>(`${this.resourceUrl}/${this.getJobHistoryIdentifier(jobHistory)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestJobHistory>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestJobHistory[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getJobHistoryIdentifier(jobHistory: Pick<IJobHistory, 'id'>): number {
    return jobHistory.id;
  }

  compareJobHistory(o1: Pick<IJobHistory, 'id'> | null, o2: Pick<IJobHistory, 'id'> | null): boolean {
    return o1 && o2 ? this.getJobHistoryIdentifier(o1) === this.getJobHistoryIdentifier(o2) : o1 === o2;
  }

  addJobHistoryToCollectionIfMissing<Type extends Pick<IJobHistory, 'id'>>(
    jobHistoryCollection: Type[],
    ...jobHistoriesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const jobHistories: Type[] = jobHistoriesToCheck.filter(isPresent);
    if (jobHistories.length > 0) {
      const jobHistoryCollectionIdentifiers = jobHistoryCollection.map(jobHistoryItem => this.getJobHistoryIdentifier(jobHistoryItem)!);
      const jobHistoriesToAdd = jobHistories.filter(jobHistoryItem => {
        const jobHistoryIdentifier = this.getJobHistoryIdentifier(jobHistoryItem);
        if (jobHistoryCollectionIdentifiers.includes(jobHistoryIdentifier)) {
          return false;
        }
        jobHistoryCollectionIdentifiers.push(jobHistoryIdentifier);
        return true;
      });
      return [...jobHistoriesToAdd, ...jobHistoryCollection];
    }
    return jobHistoryCollection;
  }

  protected convertDateFromClient<T extends IJobHistory | NewJobHistory | PartialUpdateJobHistory>(jobHistory: T): RestOf<T> {
    return {
      ...jobHistory,
      startDate: jobHistory.startDate?.toJSON() ?? null,
      endDate: jobHistory.endDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restJobHistory: RestJobHistory): IJobHistory {
    return {
      ...restJobHistory,
      startDate: restJobHistory.startDate ? dayjs(restJobHistory.startDate) : undefined,
      endDate: restJobHistory.endDate ? dayjs(restJobHistory.endDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestJobHistory>): HttpResponse<IJobHistory> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestJobHistory[]>): HttpResponse<IJobHistory[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
