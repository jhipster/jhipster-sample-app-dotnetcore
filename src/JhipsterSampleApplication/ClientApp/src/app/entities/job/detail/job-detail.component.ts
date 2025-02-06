import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IJob } from '../job.model';

@Component({
  selector: 'jhi-job-detail',
  templateUrl: './job-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class JobDetailComponent {
  job = input<IJob | null>(null);

  previousState(): void {
    window.history.back();
  }
}
