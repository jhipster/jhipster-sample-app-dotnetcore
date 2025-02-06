import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { ITimeSheet } from '../time-sheet.model';

@Component({
  selector: 'jhi-time-sheet-detail',
  templateUrl: './time-sheet-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class TimeSheetDetailComponent {
  timeSheet = input<ITimeSheet | null>(null);

  previousState(): void {
    window.history.back();
  }
}
