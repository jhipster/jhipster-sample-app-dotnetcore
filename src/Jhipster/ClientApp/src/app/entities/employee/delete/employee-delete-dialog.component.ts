import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IEmployee } from '../employee.model';
import { EmployeeService } from '../service/employee.service';

@Component({
  standalone: true,
  templateUrl: './employee-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class EmployeeDeleteDialogComponent {
  employee?: IEmployee;

  constructor(
    protected employeeService: EmployeeService,
    protected activeModal: NgbActiveModal,
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.employeeService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
