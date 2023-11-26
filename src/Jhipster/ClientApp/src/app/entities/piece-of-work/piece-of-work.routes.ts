import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import { PieceOfWorkComponent } from './list/piece-of-work.component';
import { PieceOfWorkDetailComponent } from './detail/piece-of-work-detail.component';
import { PieceOfWorkUpdateComponent } from './update/piece-of-work-update.component';
import PieceOfWorkResolve from './route/piece-of-work-routing-resolve.service';

const pieceOfWorkRoute: Routes = [
  {
    path: '',
    component: PieceOfWorkComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: PieceOfWorkDetailComponent,
    resolve: {
      pieceOfWork: PieceOfWorkResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: PieceOfWorkUpdateComponent,
    resolve: {
      pieceOfWork: PieceOfWorkResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: PieceOfWorkUpdateComponent,
    resolve: {
      pieceOfWork: PieceOfWorkResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default pieceOfWorkRoute;
