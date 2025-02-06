import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITimeSheetEntry } from '../time-sheet-entry.model';
import { TimeSheetEntryService } from '../service/time-sheet-entry.service';

const timeSheetEntryResolve = (route: ActivatedRouteSnapshot): Observable<null | ITimeSheetEntry> => {
  const id = route.params.id;
  if (id) {
    return inject(TimeSheetEntryService)
      .find(id)
      .pipe(
        mergeMap((timeSheetEntry: HttpResponse<ITimeSheetEntry>) => {
          if (timeSheetEntry.body) {
            return of(timeSheetEntry.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default timeSheetEntryResolve;
