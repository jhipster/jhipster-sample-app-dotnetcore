import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IJob } from '../job.model';
import { JobService } from '../service/job.service';

const jobResolve = (route: ActivatedRouteSnapshot): Observable<null | IJob> => {
  const id = route.params.id;
  if (id) {
    return inject(JobService)
      .find(id)
      .pipe(
        mergeMap((job: HttpResponse<IJob>) => {
          if (job.body) {
            return of(job.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default jobResolve;
