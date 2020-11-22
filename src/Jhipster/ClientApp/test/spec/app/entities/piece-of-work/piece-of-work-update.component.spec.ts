import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { JhipsterTestModule } from '../../../test.module';
import { PieceOfWorkUpdateComponent } from 'app/entities/piece-of-work/piece-of-work-update.component';
import { PieceOfWorkService } from 'app/entities/piece-of-work/piece-of-work.service';
import { PieceOfWork } from 'app/shared/model/piece-of-work.model';

describe('Component Tests', () => {
  describe('PieceOfWork Management Update Component', () => {
    let comp: PieceOfWorkUpdateComponent;
    let fixture: ComponentFixture<PieceOfWorkUpdateComponent>;
    let service: PieceOfWorkService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [PieceOfWorkUpdateComponent],
        providers: [FormBuilder],
      })
        .overrideTemplate(PieceOfWorkUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(PieceOfWorkUpdateComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(PieceOfWorkService);
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', fakeAsync(() => {
        // GIVEN
        const entity = new PieceOfWork(123);
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
        const entity = new PieceOfWork();
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
