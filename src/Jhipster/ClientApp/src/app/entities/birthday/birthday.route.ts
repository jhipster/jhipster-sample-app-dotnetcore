import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Routes, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { Authority } from 'app/shared/constants/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access-service';
import { IBirthday, Birthday } from 'app/shared/model/birthday.model';
import { BirthdayService } from './birthday.service';
import { BirthdayComponent } from './birthday.component';
import { BirthdayDetailComponent } from './birthday-detail.component';
import { BirthdayUpdateComponent } from './birthday-update.component';

@Injectable({ providedIn: 'root' })
export class BirthdayResolve implements Resolve<IBirthday> {
  constructor(private service: BirthdayService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IBirthday> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        flatMap((birthday: HttpResponse<Birthday>) => {
          if (birthday.body) {
            return of(birthday.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Birthday());
  }
}

export const birthdayRoute: Routes = [
  {
    path: '',
    component: BirthdayComponent,
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.birthday.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: BirthdayDetailComponent,
    resolve: {
      birthday: BirthdayResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.birthday.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: BirthdayUpdateComponent,
    resolve: {
      birthday: BirthdayResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.birthday.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: BirthdayUpdateComponent,
    resolve: {
      birthday: BirthdayResolve,
    },
    data: {
      authorities: [Authority.USER],
      pageTitle: 'jhipsterApp.birthday.home.title',
    },
    canActivate: [UserRouteAccessService],
  },
];
