import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { PieceOfWorkDetailComponent } from './piece-of-work-detail.component';

describe('PieceOfWork Management Detail Component', () => {
  let comp: PieceOfWorkDetailComponent;
  let fixture: ComponentFixture<PieceOfWorkDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PieceOfWorkDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./piece-of-work-detail.component').then(m => m.PieceOfWorkDetailComponent),
              resolve: { pieceOfWork: () => of({ id: 32037 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(PieceOfWorkDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PieceOfWorkDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load pieceOfWork on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', PieceOfWorkDetailComponent);

      // THEN
      expect(instance.pieceOfWork()).toEqual(expect.objectContaining({ id: 32037 }));
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
