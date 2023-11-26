import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness, RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { PieceOfWorkDetailComponent } from './piece-of-work-detail.component';

describe('PieceOfWork Management Detail Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieceOfWorkDetailComponent, RouterTestingModule.withRoutes([], { bindToComponentInputs: true })],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: PieceOfWorkDetailComponent,
              resolve: { pieceOfWork: () => of({ id: 123 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(PieceOfWorkDetailComponent, '')
      .compileComponents();
  });

  describe('OnInit', () => {
    it('Should load pieceOfWork on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', PieceOfWorkDetailComponent);

      // THEN
      expect(instance.pieceOfWork).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
