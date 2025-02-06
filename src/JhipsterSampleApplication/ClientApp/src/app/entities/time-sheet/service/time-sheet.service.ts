import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITimeSheet, NewTimeSheet } from '../time-sheet.model';

export type PartialUpdateTimeSheet = Partial<ITimeSheet> & Pick<ITimeSheet, 'id'>;

type RestOf<T extends ITimeSheet | NewTimeSheet> = Omit<T, 'timeSheetDate'> & {
  timeSheetDate?: string | null;
};

export type RestTimeSheet = RestOf<ITimeSheet>;

export type NewRestTimeSheet = RestOf<NewTimeSheet>;

export type PartialUpdateRestTimeSheet = RestOf<PartialUpdateTimeSheet>;

export type EntityResponseType = HttpResponse<ITimeSheet>;
export type EntityArrayResponseType = HttpResponse<ITimeSheet[]>;

@Injectable({ providedIn: 'root' })
export class TimeSheetService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/time-sheets');

  create(timeSheet: NewTimeSheet): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(timeSheet);
    return this.http
      .post<RestTimeSheet>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(timeSheet: ITimeSheet): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(timeSheet);
    return this.http
      .put<RestTimeSheet>(`${this.resourceUrl}/${this.getTimeSheetIdentifier(timeSheet)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(timeSheet: PartialUpdateTimeSheet): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(timeSheet);
    return this.http
      .patch<RestTimeSheet>(`${this.resourceUrl}/${this.getTimeSheetIdentifier(timeSheet)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestTimeSheet>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestTimeSheet[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTimeSheetIdentifier(timeSheet: Pick<ITimeSheet, 'id'>): string {
    return timeSheet.id;
  }

  compareTimeSheet(o1: Pick<ITimeSheet, 'id'> | null, o2: Pick<ITimeSheet, 'id'> | null): boolean {
    return o1 && o2 ? this.getTimeSheetIdentifier(o1) === this.getTimeSheetIdentifier(o2) : o1 === o2;
  }

  addTimeSheetToCollectionIfMissing<Type extends Pick<ITimeSheet, 'id'>>(
    timeSheetCollection: Type[],
    ...timeSheetsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const timeSheets: Type[] = timeSheetsToCheck.filter(isPresent);
    if (timeSheets.length > 0) {
      const timeSheetCollectionIdentifiers = timeSheetCollection.map(timeSheetItem => this.getTimeSheetIdentifier(timeSheetItem));
      const timeSheetsToAdd = timeSheets.filter(timeSheetItem => {
        const timeSheetIdentifier = this.getTimeSheetIdentifier(timeSheetItem);
        if (timeSheetCollectionIdentifiers.includes(timeSheetIdentifier)) {
          return false;
        }
        timeSheetCollectionIdentifiers.push(timeSheetIdentifier);
        return true;
      });
      return [...timeSheetsToAdd, ...timeSheetCollection];
    }
    return timeSheetCollection;
  }

  protected convertDateFromClient<T extends ITimeSheet | NewTimeSheet | PartialUpdateTimeSheet>(timeSheet: T): RestOf<T> {
    return {
      ...timeSheet,
      timeSheetDate: timeSheet.timeSheetDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restTimeSheet: RestTimeSheet): ITimeSheet {
    return {
      ...restTimeSheet,
      timeSheetDate: restTimeSheet.timeSheetDate ? dayjs(restTimeSheet.timeSheetDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestTimeSheet>): HttpResponse<ITimeSheet> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestTimeSheet[]>): HttpResponse<ITimeSheet[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
