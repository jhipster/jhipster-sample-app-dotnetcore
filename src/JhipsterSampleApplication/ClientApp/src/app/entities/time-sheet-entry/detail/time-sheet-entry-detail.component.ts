import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ITimeSheetEntry } from '../time-sheet-entry.model';

@Component({
  selector: 'jhi-time-sheet-entry-detail',
  templateUrl: './time-sheet-entry-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class TimeSheetEntryDetailComponent {
  timeSheetEntry = input<ITimeSheetEntry | null>(null);

  previousState(): void {
    window.history.back();
  }
}
