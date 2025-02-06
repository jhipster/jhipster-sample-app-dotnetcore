import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { TimeSheetDetailComponent } from './time-sheet-detail.component';

describe('TimeSheet Management Detail Component', () => {
  let comp: TimeSheetDetailComponent;
  let fixture: ComponentFixture<TimeSheetDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSheetDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./time-sheet-detail.component').then(m => m.TimeSheetDetailComponent),
              resolve: { timeSheet: () => of({ id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(TimeSheetDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSheetDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load timeSheet on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', TimeSheetDetailComponent);

      // THEN
      expect(instance.timeSheet()).toEqual(expect.objectContaining({ id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' }));
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
