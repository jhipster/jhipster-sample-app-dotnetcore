import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { JhipsterTestModule } from '../../../test.module';
import { BirthdayDetailComponent } from 'app/entities/birthday/birthday-detail.component';
import { Birthday } from 'app/shared/model/birthday.model';

describe('Component Tests', () => {
  describe('Birthday Management Detail Component', () => {
    let comp: BirthdayDetailComponent;
    let fixture: ComponentFixture<BirthdayDetailComponent>;
    const route = ({ data: of({ birthday: new Birthday(123) }) } as any) as ActivatedRoute;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [BirthdayDetailComponent],
        providers: [{ provide: ActivatedRoute, useValue: route }],
      })
        .overrideTemplate(BirthdayDetailComponent, '')
        .compileComponents();
      fixture = TestBed.createComponent(BirthdayDetailComponent);
      comp = fixture.componentInstance;
    });

    describe('OnInit', () => {
      it('Should load birthday on init', () => {
        // WHEN
        comp.ngOnInit();

        // THEN
        expect(comp.birthday).toEqual(jasmine.objectContaining({ id: 123 }));
      });
    });
  });
});
