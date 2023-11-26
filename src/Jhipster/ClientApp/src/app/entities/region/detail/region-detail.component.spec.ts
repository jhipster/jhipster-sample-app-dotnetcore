import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness, RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { RegionDetailComponent } from './region-detail.component';

describe('Region Management Detail Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegionDetailComponent, RouterTestingModule.withRoutes([], { bindToComponentInputs: true })],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: RegionDetailComponent,
              resolve: { region: () => of({ id: 123 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(RegionDetailComponent, '')
      .compileComponents();
  });

  describe('OnInit', () => {
    it('Should load region on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', RegionDetailComponent);

      // THEN
      expect(instance.region).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
