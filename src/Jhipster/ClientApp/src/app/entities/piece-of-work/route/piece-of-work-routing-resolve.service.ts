import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of, EMPTY, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPieceOfWork } from '../piece-of-work.model';
import { PieceOfWorkService } from '../service/piece-of-work.service';

export const pieceOfWorkResolve = (route: ActivatedRouteSnapshot): Observable<null | IPieceOfWork> => {
  const id = route.params['id'];
  if (id) {
    return inject(PieceOfWorkService)
      .find(id)
      .pipe(
        mergeMap((pieceOfWork: HttpResponse<IPieceOfWork>) => {
          if (pieceOfWork.body) {
            return of(pieceOfWork.body);
          } else {
            inject(Router).navigate(['404']);
            return EMPTY;
          }
        }),
      );
  }
  return of(null);
};

export default pieceOfWorkResolve;
