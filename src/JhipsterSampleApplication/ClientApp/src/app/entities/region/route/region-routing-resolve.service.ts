import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IRegion } from '../region.model';
import { RegionService } from '../service/region.service';

const regionResolve = (route: ActivatedRouteSnapshot): Observable<null | IRegion> => {
  const id = route.params.id;
  if (id) {
    return inject(RegionService)
      .find(id)
      .pipe(
        mergeMap((region: HttpResponse<IRegion>) => {
          if (region.body) {
            return of(region.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default regionResolve;
