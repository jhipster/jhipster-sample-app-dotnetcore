import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import TimeSheetEntryResolve from './route/time-sheet-entry-routing-resolve.service';

const timeSheetEntryRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/time-sheet-entry.component').then(m => m.TimeSheetEntryComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/time-sheet-entry-detail.component').then(m => m.TimeSheetEntryDetailComponent),
    resolve: {
      timeSheetEntry: TimeSheetEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/time-sheet-entry-update.component').then(m => m.TimeSheetEntryUpdateComponent),
    resolve: {
      timeSheetEntry: TimeSheetEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/time-sheet-entry-update.component').then(m => m.TimeSheetEntryUpdateComponent),
    resolve: {
      timeSheetEntry: TimeSheetEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default timeSheetEntryRoute;
