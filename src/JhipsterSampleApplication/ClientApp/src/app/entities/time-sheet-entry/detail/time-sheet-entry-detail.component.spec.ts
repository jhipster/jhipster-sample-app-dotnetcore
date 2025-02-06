import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { TimeSheetEntryDetailComponent } from './time-sheet-entry-detail.component';

describe('TimeSheetEntry Management Detail Component', () => {
  let comp: TimeSheetEntryDetailComponent;
  let fixture: ComponentFixture<TimeSheetEntryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSheetEntryDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./time-sheet-entry-detail.component').then(m => m.TimeSheetEntryDetailComponent),
              resolve: { timeSheetEntry: () => of({ id: 5799 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(TimeSheetEntryDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetEntryDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load timeSheetEntry on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', TimeSheetEntryDetailComponent);

      // THEN
      expect(instance.timeSheetEntry()).toEqual(expect.objectContaining({ id: 5799 }));
    });
  });

  describe('PreviousState', () => {
    it('Should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
