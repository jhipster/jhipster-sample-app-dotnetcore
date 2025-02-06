import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import CountryResolve from './route/country-routing-resolve.service';

const countryRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/country.component').then(m => m.CountryComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/country-detail.component').then(m => m.CountryDetailComponent),
    resolve: {
      country: CountryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/country-update.component').then(m => m.CountryUpdateComponent),
    resolve: {
      country: CountryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/country-update.component').then(m => m.CountryUpdateComponent),
    resolve: {
      country: CountryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default countryRoute;
