import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import { JobComponent } from './list/job.component';
import { JobDetailComponent } from './detail/job-detail.component';
import { JobUpdateComponent } from './update/job-update.component';
import JobResolve from './route/job-routing-resolve.service';

const jobRoute: Routes = [
  {
    path: '',
    component: JobComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: JobDetailComponent,
    resolve: {
      job: JobResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: JobUpdateComponent,
    resolve: {
      job: JobResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: JobUpdateComponent,
    resolve: {
      job: JobResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default jobRoute;
