import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ICountry } from '../country.model';
import { CountryService } from '../service/country.service';

export const countryResolve = (route: ActivatedRouteSnapshot): Observable<null | ICountry> => {
  const id = route.params['id'];
  if (id) {
    return inject(CountryService)
      .find(id)
      .pipe(
        mergeMap((country: HttpResponse<ICountry>) => {
          if (country.body) {
            return of(country.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default countryResolve;
