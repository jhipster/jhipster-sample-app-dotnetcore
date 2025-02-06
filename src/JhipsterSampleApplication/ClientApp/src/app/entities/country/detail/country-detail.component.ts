import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ICountry } from '../country.model';

@Component({
  selector: 'jhi-country-detail',
  templateUrl: './country-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class CountryDetailComponent {
  country = input<ICountry | null>(null);

  previousState(): void {
    window.history.back();
  }
}
