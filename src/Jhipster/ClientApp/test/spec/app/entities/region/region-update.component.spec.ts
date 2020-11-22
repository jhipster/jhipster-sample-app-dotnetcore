import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { JhipsterTestModule } from '../../../test.module';
import { RegionUpdateComponent } from 'app/entities/region/region-update.component';
import { RegionService } from 'app/entities/region/region.service';
import { Region } from 'app/shared/model/region.model';

describe('Component Tests', () => {
  describe('Region Management Update Component', () => {
    let comp: RegionUpdateComponent;
    let fixture: ComponentFixture<RegionUpdateComponent>;
    let service: RegionService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [RegionUpdateComponent],
        providers: [FormBuilder],
      })
        .overrideTemplate(RegionUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(RegionUpdateComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(RegionService);
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', fakeAsync(() => {
        // GIVEN
        const entity = new Region(123);
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
        const entity = new Region();
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
