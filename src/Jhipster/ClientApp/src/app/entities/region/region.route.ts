import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { Authority } from 'app/shared/constants/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { IRegion, Region } from 'app/shared/model/region.model';
import { RegionService } from './region.service';
import { RegionComponent } from './region.component';
import { RegionDetailComponent } from './region-detail.component';
import { RegionUpdateComponent } from './region-update.component';

@Injectable({ providedIn: 'root' })
export class RegionResolve implements Resolve<IRegion> {
  constructor(private service: RegionService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IRegion> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((region: HttpResponse<Region>) => {
          if (region.body) {
            return of(region.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Region());
  }
}

export const regionRoute: Routes = [
  {
    path: '',
    component: RegionComponent,
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.region.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: RegionDetailComponent,
    resolve: {
      region: RegionResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.region.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: RegionUpdateComponent,
    resolve: {
      region: RegionResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.region.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: RegionUpdateComponent,
    resolve: {
      region: RegionResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.region.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
];
