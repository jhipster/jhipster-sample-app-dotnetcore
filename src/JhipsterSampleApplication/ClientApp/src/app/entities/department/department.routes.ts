import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import DepartmentResolve from './route/department-routing-resolve.service';

const departmentRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/department.component').then(m => m.DepartmentComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/department-detail.component').then(m => m.DepartmentDetailComponent),
    resolve: {
      department: DepartmentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/department-update.component').then(m => m.DepartmentUpdateComponent),
    resolve: {
      department: DepartmentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/department-update.component').then(m => m.DepartmentUpdateComponent),
    resolve: {
      department: DepartmentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default departmentRoute;
