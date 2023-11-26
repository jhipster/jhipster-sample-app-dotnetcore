import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness, RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { LocationDetailComponent } from './location-detail.component';

describe('Location Management Detail Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationDetailComponent, RouterTestingModule.withRoutes([], { bindToComponentInputs: true })],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: LocationDetailComponent,
              resolve: { location: () => of({ id: 123 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(LocationDetailComponent, '')
      .compileComponents();
  });

  describe('OnInit', () => {
    it('Should load location on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', LocationDetailComponent);

      // THEN
      expect(instance.location).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
