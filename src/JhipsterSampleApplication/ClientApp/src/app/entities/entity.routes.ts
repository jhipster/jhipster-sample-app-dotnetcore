import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'country',
    data: { pageTitle: 'Countries' },
    loadChildren: () => import('./country/country.routes'),
  },
  {
    path: 'department',
    data: { pageTitle: 'Departments' },
    loadChildren: () => import('./department/department.routes'),
  },
  {
    path: 'employee',
    data: { pageTitle: 'Employees' },
    loadChildren: () => import('./employee/employee.routes'),
  },
  {
    path: 'job',
    data: { pageTitle: 'Jobs' },
    loadChildren: () => import('./job/job.routes'),
  },
  {
    path: 'job-history',
    data: { pageTitle: 'JobHistories' },
    loadChildren: () => import('./job-history/job-history.routes'),
  },
  {
    path: 'location',
    data: { pageTitle: 'Locations' },
    loadChildren: () => import('./location/location.routes'),
  },
  {
    path: 'piece-of-work',
    data: { pageTitle: 'PieceOfWorks' },
    loadChildren: () => import('./piece-of-work/piece-of-work.routes'),
  },
  {
    path: 'region',
    data: { pageTitle: 'Regions' },
    loadChildren: () => import('./region/region.routes'),
  },
  {
    path: 'time-sheet',
    data: { pageTitle: 'TimeSheets' },
    loadChildren: () => import('./time-sheet/time-sheet.routes'),
  },
  {
    path: 'time-sheet-entry',
    data: { pageTitle: 'TimeSheetEntries' },
    loadChildren: () => import('./time-sheet-entry/time-sheet-entry.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
