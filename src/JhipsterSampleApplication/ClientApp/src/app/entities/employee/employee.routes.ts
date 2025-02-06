import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import EmployeeResolve from './route/employee-routing-resolve.service';

const employeeRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/employee.component').then(m => m.EmployeeComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/employee-detail.component').then(m => m.EmployeeDetailComponent),
    resolve: {
      employee: EmployeeResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/employee-update.component').then(m => m.EmployeeUpdateComponent),
    resolve: {
      employee: EmployeeResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/employee-update.component').then(m => m.EmployeeUpdateComponent),
    resolve: {
      employee: EmployeeResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default employeeRoute;
