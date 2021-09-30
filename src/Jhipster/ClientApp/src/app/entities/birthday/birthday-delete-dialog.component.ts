import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager } from 'ng-jhipster';

import { IBirthday } from 'app/shared/model/birthday.model';
import { BirthdayService } from './birthday.service';

@Component({
  templateUrl: './birthday-delete-dialog.component.html',
})
export class BirthdayDeleteDialogComponent {
  birthday?: IBirthday;

  constructor(protected birthdayService: BirthdayService, public activeModal: NgbActiveModal, protected eventManager: JhiEventManager) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.birthdayService.delete(id).subscribe(() => {
      this.eventManager.broadcast('birthdayListModification');
      this.activeModal.close();
    });
  }
}
