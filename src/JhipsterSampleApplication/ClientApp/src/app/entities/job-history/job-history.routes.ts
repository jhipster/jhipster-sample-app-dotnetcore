import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import JobHistoryResolve from './route/job-history-routing-resolve.service';

const jobHistoryRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/job-history.component').then(m => m.JobHistoryComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/job-history-detail.component').then(m => m.JobHistoryDetailComponent),
    resolve: {
      jobHistory: JobHistoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/job-history-update.component').then(m => m.JobHistoryUpdateComponent),
    resolve: {
      jobHistory: JobHistoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/job-history-update.component').then(m => m.JobHistoryUpdateComponent),
    resolve: {
      jobHistory: JobHistoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default jobHistoryRoute;
