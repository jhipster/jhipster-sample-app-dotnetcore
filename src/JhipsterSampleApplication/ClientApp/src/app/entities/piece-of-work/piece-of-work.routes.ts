import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import PieceOfWorkResolve from './route/piece-of-work-routing-resolve.service';

const pieceOfWorkRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/piece-of-work.component').then(m => m.PieceOfWorkComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/piece-of-work-detail.component').then(m => m.PieceOfWorkDetailComponent),
    resolve: {
      pieceOfWork: PieceOfWorkResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/piece-of-work-update.component').then(m => m.PieceOfWorkUpdateComponent),
    resolve: {
      pieceOfWork: PieceOfWorkResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/piece-of-work-update.component').then(m => m.PieceOfWorkUpdateComponent),
    resolve: {
      pieceOfWork: PieceOfWorkResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default pieceOfWorkRoute;
