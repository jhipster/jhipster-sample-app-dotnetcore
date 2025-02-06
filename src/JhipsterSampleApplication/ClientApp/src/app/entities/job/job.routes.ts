import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import JobResolve from './route/job-routing-resolve.service';

const jobRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/job.component').then(m => m.JobComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/job-detail.component').then(m => m.JobDetailComponent),
    resolve: {
      job: JobResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/job-update.component').then(m => m.JobUpdateComponent),
    resolve: {
      job: JobResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/job-update.component').then(m => m.JobUpdateComponent),
    resolve: {
      job: JobResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default jobRoute;
