import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IDepartment } from '../department.model';
import { DepartmentService } from '../service/department.service';

@Component({
  templateUrl: './department-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class DepartmentDeleteDialogComponent {
  department?: IDepartment;

  protected departmentService = inject(DepartmentService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.departmentService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
