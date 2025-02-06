import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ILocation } from '../location.model';

@Component({
  selector: 'jhi-location-detail',
  templateUrl: './location-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class LocationDetailComponent {
  location = input<ILocation | null>(null);

  previousState(): void {
    window.history.back();
  }
}
