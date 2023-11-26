import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import { JobHistoryComponent } from './list/job-history.component';
import { JobHistoryDetailComponent } from './detail/job-history-detail.component';
import { JobHistoryUpdateComponent } from './update/job-history-update.component';
import JobHistoryResolve from './route/job-history-routing-resolve.service';

const jobHistoryRoute: Routes = [
  {
    path: '',
    component: JobHistoryComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: JobHistoryDetailComponent,
    resolve: {
      jobHistory: JobHistoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: JobHistoryUpdateComponent,
    resolve: {
      jobHistory: JobHistoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: JobHistoryUpdateComponent,
    resolve: {
      jobHistory: JobHistoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default jobHistoryRoute;
