import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITimeSheetEntry, NewTimeSheetEntry } from '../time-sheet-entry.model';

export type PartialUpdateTimeSheetEntry = Partial<ITimeSheetEntry> & Pick<ITimeSheetEntry, 'id'>;

export type EntityResponseType = HttpResponse<ITimeSheetEntry>;
export type EntityArrayResponseType = HttpResponse<ITimeSheetEntry[]>;

@Injectable({ providedIn: 'root' })
export class TimeSheetEntryService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/time-sheet-entries');

  create(timeSheetEntry: NewTimeSheetEntry): Observable<EntityResponseType> {
    return this.http.post<ITimeSheetEntry>(this.resourceUrl, timeSheetEntry, { observe: 'response' });
  }

  update(timeSheetEntry: ITimeSheetEntry): Observable<EntityResponseType> {
    return this.http.put<ITimeSheetEntry>(`${this.resourceUrl}/${this.getTimeSheetEntryIdentifier(timeSheetEntry)}`, timeSheetEntry, {
      observe: 'response',
    });
  }

  partialUpdate(timeSheetEntry: PartialUpdateTimeSheetEntry): Observable<EntityResponseType> {
    return this.http.patch<ITimeSheetEntry>(`${this.resourceUrl}/${this.getTimeSheetEntryIdentifier(timeSheetEntry)}`, timeSheetEntry, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ITimeSheetEntry>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ITimeSheetEntry[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTimeSheetEntryIdentifier(timeSheetEntry: Pick<ITimeSheetEntry, 'id'>): number {
    return timeSheetEntry.id;
  }

  compareTimeSheetEntry(o1: Pick<ITimeSheetEntry, 'id'> | null, o2: Pick<ITimeSheetEntry, 'id'> | null): boolean {
    return o1 && o2 ? this.getTimeSheetEntryIdentifier(o1) === this.getTimeSheetEntryIdentifier(o2) : o1 === o2;
  }

  addTimeSheetEntryToCollectionIfMissing<Type extends Pick<ITimeSheetEntry, 'id'>>(
    timeSheetEntryCollection: Type[],
    ...timeSheetEntriesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const timeSheetEntries: Type[] = timeSheetEntriesToCheck.filter(isPresent);
    if (timeSheetEntries.length > 0) {
      const timeSheetEntryCollectionIdentifiers = timeSheetEntryCollection.map(timeSheetEntryItem =>
        this.getTimeSheetEntryIdentifier(timeSheetEntryItem),
      );
      const timeSheetEntriesToAdd = timeSheetEntries.filter(timeSheetEntryItem => {
        const timeSheetEntryIdentifier = this.getTimeSheetEntryIdentifier(timeSheetEntryItem);
        if (timeSheetEntryCollectionIdentifiers.includes(timeSheetEntryIdentifier)) {
          return false;
        }
        timeSheetEntryCollectionIdentifiers.push(timeSheetEntryIdentifier);
        return true;
      });
      return [...timeSheetEntriesToAdd, ...timeSheetEntryCollection];
    }
    return timeSheetEntryCollection;
  }
}
