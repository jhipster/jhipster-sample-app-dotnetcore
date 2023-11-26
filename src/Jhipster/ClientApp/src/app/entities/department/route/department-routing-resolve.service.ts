import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IDepartment } from '../department.model';
import { DepartmentService } from '../service/department.service';

export const departmentResolve = (route: ActivatedRouteSnapshot): Observable<null | IDepartment> => {
  const id = route.params['id'];
  if (id) {
    return inject(DepartmentService)
      .find(id)
      .pipe(
        mergeMap((department: HttpResponse<IDepartment>) => {
          if (department.body) {
            return of(department.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default departmentResolve;
