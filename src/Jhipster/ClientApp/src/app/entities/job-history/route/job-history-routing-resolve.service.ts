import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IJobHistory } from '../job-history.model';
import { JobHistoryService } from '../service/job-history.service';

export const jobHistoryResolve = (route: ActivatedRouteSnapshot): Observable<null | IJobHistory> => {
  const id = route.params['id'];
  if (id) {
    return inject(JobHistoryService)
      .find(id)
      .pipe(
        mergeMap((jobHistory: HttpResponse<IJobHistory>) => {
          if (jobHistory.body) {
            return of(jobHistory.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default jobHistoryResolve;
