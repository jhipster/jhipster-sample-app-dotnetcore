import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { JhipsterTestModule } from '../../../test.module';
import { BirthdayUpdateComponent } from 'app/entities/birthday/birthday-update.component';
import { BirthdayService } from 'app/entities/birthday/birthday.service';
import { Birthday } from 'app/shared/model/birthday.model';

describe('Component Tests', () => {
  describe('Birthday Management Update Component', () => {
    let comp: BirthdayUpdateComponent;
    let fixture: ComponentFixture<BirthdayUpdateComponent>;
    let service: BirthdayService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [BirthdayUpdateComponent],
        providers: [FormBuilder],
      })
        .overrideTemplate(BirthdayUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(BirthdayUpdateComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(BirthdayService);
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', fakeAsync(() => {
        // GIVEN
        const entity = new Birthday(123);
        spyOn(service, 'update').and.returnValue(of(new HttpResponse({ body: entity })));
        comp.updateForm(entity);
        // WHEN
        comp.save();
        tick(); // simulate async

        // THEN
        expect(service.update).toHaveBeenCalledWith(entity);
        expect(comp.isSaving).toEqual(false);
      }));

      it('Should call create service on save for new entity', fakeAsync(() => {
        // GIVEN
        const entity = new Birthday();
        spyOn(service, 'create').and.returnValue(of(new HttpResponse({ body: entity })));
        comp.updateForm(entity);
        // WHEN
        comp.save();
        tick(); // simulate async

        // THEN
        expect(service.create).toHaveBeenCalledWith(entity);
        expect(comp.isSaving).toEqual(false);
      }));
    });
  });
});
