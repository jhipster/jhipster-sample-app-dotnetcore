import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ICountry } from '../country.model';
import { CountryService } from '../service/country.service';

@Component({
  standalone: true,
  templateUrl: './country-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class CountryDeleteDialogComponent {
  country?: ICountry;

  constructor(
    protected countryService: CountryService,
    protected activeModal: NgbActiveModal,
  ) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.countryService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
