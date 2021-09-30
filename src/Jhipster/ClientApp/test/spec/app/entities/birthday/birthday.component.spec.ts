import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { JhipsterTestModule } from '../../../test.module';
import { BirthdayComponent } from 'app/entities/birthday/birthday.component';
import { BirthdayService } from 'app/entities/birthday/birthday.service';
import { Birthday } from 'app/shared/model/birthday.model';

describe('Component Tests', () => {
  describe('Birthday Management Component', () => {
    let comp: BirthdayComponent;
    let fixture: ComponentFixture<BirthdayComponent>;
    let service: BirthdayService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [BirthdayComponent],
      })
        .overrideTemplate(BirthdayComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(BirthdayComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(BirthdayService);
    });

    it('Should call load all on init', () => {
      // GIVEN
      const headers = new HttpHeaders().append('link', 'link;link');
      spyOn(service, 'query').and.returnValue(
        of(
          new HttpResponse({
            body: [new Birthday(123)],
            headers,
          })
        )
      );

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.birthdays && comp.birthdays[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });
  });
});
