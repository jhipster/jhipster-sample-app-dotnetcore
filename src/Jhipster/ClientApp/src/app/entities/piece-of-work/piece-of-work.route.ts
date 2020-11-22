import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { Authority } from 'app/shared/constants/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { IPieceOfWork, PieceOfWork } from 'app/shared/model/piece-of-work.model';
import { PieceOfWorkService } from './piece-of-work.service';
import { PieceOfWorkComponent } from './piece-of-work.component';
import { PieceOfWorkDetailComponent } from './piece-of-work-detail.component';
import { PieceOfWorkUpdateComponent } from './piece-of-work-update.component';

@Injectable({ providedIn: 'root' })
export class PieceOfWorkResolve implements Resolve<IPieceOfWork> {
  constructor(private service: PieceOfWorkService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IPieceOfWork> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((pieceOfWork: HttpResponse<PieceOfWork>) => {
          if (pieceOfWork.body) {
            return of(pieceOfWork.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new PieceOfWork());
  }
}

export const pieceOfWorkRoute: Routes = [
  {
    path: '',
    component: PieceOfWorkComponent,
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.pieceOfWork.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: PieceOfWorkDetailComponent,
    resolve: {
      pieceOfWork: PieceOfWorkResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.pieceOfWork.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: PieceOfWorkUpdateComponent,
    resolve: {
      pieceOfWork: PieceOfWorkResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.pieceOfWork.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: PieceOfWorkUpdateComponent,
    resolve: {
      pieceOfWork: PieceOfWorkResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.pieceOfWork.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
];
