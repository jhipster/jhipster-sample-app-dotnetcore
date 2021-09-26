import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'category',
        loadChildren: () => import('./category/category.module').then(m => m.JhipsterCategoryModule),
      },
      {
        path: 'country',
        loadChildren: () => import('./country/country.module').then(m => m.JhipsterCountryModule),
      },
      {
        path: 'location',
        loadChildren: () => import('./location/location.module').then(m => m.JhipsterLocationModule),
      },
      {
        path: 'department',
        loadChildren: () => import('./department/department.module').then(m => m.JhipsterDepartmentModule),
      },
      {
        path: 'piece-of-work',
        loadChildren: () => import('./piece-of-work/piece-of-work.module').then(m => m.JhipsterPieceOfWorkModule),
      },
      {
        path: 'employee',
        loadChildren: () => import('./employee/employee.module').then(m => m.JhipsterEmployeeModule),
      },
      {
        path: 'job',
        loadChildren: () => import('./job/job.module').then(m => m.JhipsterJobModule),
      },
      {
        path: 'job-history',
        loadChildren: () => import('./job-history/job-history.module').then(m => m.JhipsterJobHistoryModule),
      },
      {
        path: 'birthday',
        loadChildren: () => import('./birthday/birthday.module').then(m => m.JhipsterBirthdayModule),
      },      
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class JhipsterEntityModule {}
