import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IDepartment } from '../department.model';

@Component({
  selector: 'jhi-department-detail',
  templateUrl: './department-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class DepartmentDetailComponent {
  department = input<IDepartment | null>(null);

  previousState(): void {
    window.history.back();
  }
}
