import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ICountry } from '../country.model';
import { CountryService } from '../service/country.service';

const countryResolve = (route: ActivatedRouteSnapshot): Observable<null | ICountry> => {
  const id = route.params.id;
  if (id) {
    return inject(CountryService)
      .find(id)
      .pipe(
        mergeMap((country: HttpResponse<ICountry>) => {
          if (country.body) {
            return of(country.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default countryResolve;
