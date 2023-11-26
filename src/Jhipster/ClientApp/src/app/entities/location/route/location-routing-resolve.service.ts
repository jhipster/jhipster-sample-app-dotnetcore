import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ILocation } from '../location.model';
import { LocationService } from '../service/location.service';

export const locationResolve = (route: ActivatedRouteSnapshot): Observable<null | ILocation> => {
  const id = route.params['id'];
  if (id) {
    return inject(LocationService)
      .find(id)
      .pipe(
        mergeMap((location: HttpResponse<ILocation>) => {
          if (location.body) {
            return of(location.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default locationResolve;
