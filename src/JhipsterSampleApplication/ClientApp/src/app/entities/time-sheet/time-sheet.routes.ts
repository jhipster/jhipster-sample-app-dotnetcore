import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import TimeSheetResolve from './route/time-sheet-routing-resolve.service';

const timeSheetRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/time-sheet.component').then(m => m.TimeSheetComponent),
    data: {},
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/time-sheet-detail.component').then(m => m.TimeSheetDetailComponent),
    resolve: {
      timeSheet: TimeSheetResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/time-sheet-update.component').then(m => m.TimeSheetUpdateComponent),
    resolve: {
      timeSheet: TimeSheetResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/time-sheet-update.component').then(m => m.TimeSheetUpdateComponent),
    resolve: {
      timeSheet: TimeSheetResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default timeSheetRoute;
