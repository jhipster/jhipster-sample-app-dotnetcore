import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness, RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { JobHistoryDetailComponent } from './job-history-detail.component';

describe('JobHistory Management Detail Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobHistoryDetailComponent, RouterTestingModule.withRoutes([], { bindToComponentInputs: true })],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: JobHistoryDetailComponent,
              resolve: { jobHistory: () => of({ id: 123 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(JobHistoryDetailComponent, '')
      .compileComponents();
  });

  describe('OnInit', () => {
    it('Should load jobHistory on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', JobHistoryDetailComponent);

      // THEN
      expect(instance.jobHistory).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
