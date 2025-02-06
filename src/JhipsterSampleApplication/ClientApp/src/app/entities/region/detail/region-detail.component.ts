import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IRegion } from '../region.model';

@Component({
  selector: 'jhi-region-detail',
  templateUrl: './region-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class RegionDetailComponent {
  region = input<IRegion | null>(null);

  previousState(): void {
    window.history.back();
  }
}
