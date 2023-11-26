import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness, RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { DepartmentDetailComponent } from './department-detail.component';

describe('Department Management Detail Component', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentDetailComponent, RouterTestingModule.withRoutes([], { bindToComponentInputs: true })],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              component: DepartmentDetailComponent,
              resolve: { department: () => of({ id: 123 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(DepartmentDetailComponent, '')
      .compileComponents();
  });

  describe('OnInit', () => {
    it('Should load department on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', DepartmentDetailComponent);

      // THEN
      expect(instance.department).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
