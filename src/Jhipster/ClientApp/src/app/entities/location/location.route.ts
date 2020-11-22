import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { Authority } from 'app/shared/constants/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { ILocation, Location } from 'app/shared/model/location.model';
import { LocationService } from './location.service';
import { LocationComponent } from './location.component';
import { LocationDetailComponent } from './location-detail.component';
import { LocationUpdateComponent } from './location-update.component';

@Injectable({ providedIn: 'root' })
export class LocationResolve implements Resolve<ILocation> {
  constructor(private service: LocationService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ILocation> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((location: HttpResponse<Location>) => {
          if (location.body) {
            return of(location.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Location());
  }
}

export const locationRoute: Routes = [
  {
    path: '',
    component: LocationComponent,
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.location.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: LocationDetailComponent,
    resolve: {
      location: LocationResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.location.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: LocationUpdateComponent,
    resolve: {
      location: LocationResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.location.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: LocationUpdateComponent,
    resolve: {
      location: LocationResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.location.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
];
