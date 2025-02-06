import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import LocationResolve from './route/location-routing-resolve.service';

const locationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/location.component').then(m => m.LocationComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/location-detail.component').then(m => m.LocationDetailComponent),
    resolve: {
      location: LocationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/location-update.component').then(m => m.LocationUpdateComponent),
    resolve: {
      location: LocationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/location-update.component').then(m => m.LocationUpdateComponent),
    resolve: {
      location: LocationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default locationRoute;
