import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IEmployee } from '../employee.model';
import { EmployeeService } from '../service/employee.service';

const employeeResolve = (route: ActivatedRouteSnapshot): Observable<null | IEmployee> => {
  const id = route.params.id;
  if (id) {
    return inject(EmployeeService)
      .find(id)
      .pipe(
        mergeMap((employee: HttpResponse<IEmployee>) => {
          if (employee.body) {
            return of(employee.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default employeeResolve;
