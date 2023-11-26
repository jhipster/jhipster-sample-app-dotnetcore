import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IJob, NewJob } from '../job.model';

export type PartialUpdateJob = Partial<IJob> & Pick<IJob, 'id'>;

export type EntityResponseType = HttpResponse<IJob>;
export type EntityArrayResponseType = HttpResponse<IJob[]>;

@Injectable({ providedIn: 'root' })
export class JobService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/jobs');

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
  ) {}

  create(job: NewJob): Observable<EntityResponseType> {
    return this.http.post<IJob>(this.resourceUrl, job, { observe: 'response' });
  }

  update(job: IJob): Observable<EntityResponseType> {
    return this.http.put<IJob>(`${this.resourceUrl}/${this.getJobIdentifier(job)}`, job, { observe: 'response' });
  }

  partialUpdate(job: PartialUpdateJob): Observable<EntityResponseType> {
    return this.http.patch<IJob>(`${this.resourceUrl}/${this.getJobIdentifier(job)}`, job, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IJob>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IJob[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getJobIdentifier(job: Pick<IJob, 'id'>): number {
    return job.id;
  }

  compareJob(o1: Pick<IJob, 'id'> | null, o2: Pick<IJob, 'id'> | null): boolean {
    return o1 && o2 ? this.getJobIdentifier(o1) === this.getJobIdentifier(o2) : o1 === o2;
  }

  addJobToCollectionIfMissing<Type extends Pick<IJob, 'id'>>(jobCollection: Type[], ...jobsToCheck: (Type | null | undefined)[]): Type[] {
    const jobs: Type[] = jobsToCheck.filter(isPresent);
    if (jobs.length > 0) {
      const jobCollectionIdentifiers = jobCollection.map(jobItem => this.getJobIdentifier(jobItem)!);
      const jobsToAdd = jobs.filter(jobItem => {
        const jobIdentifier = this.getJobIdentifier(jobItem);
        if (jobCollectionIdentifiers.includes(jobIdentifier)) {
          return false;
        }
        jobCollectionIdentifiers.push(jobIdentifier);
        return true;
      });
      return [...jobsToAdd, ...jobCollection];
    }
    return jobCollection;
  }
}
