import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

import { JhipsterTestModule } from '../../../test.module';
import { CategoryUpdateComponent } from 'app/entities/category/category-update.component';
import { CategoryService } from 'app/entities/category/category.service';
import { Category } from 'app/shared/model/category.model';

describe('Component Tests', () => {
  describe('Category Management Update Component', () => {
    let comp: CategoryUpdateComponent;
    let fixture: ComponentFixture<CategoryUpdateComponent>;
    let service: CategoryService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [CategoryUpdateComponent],
        providers: [FormBuilder],
      })
        .overrideTemplate(CategoryUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(CategoryUpdateComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(CategoryService);
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', fakeAsync(() => {
        // GIVEN
        const entity = new Category(123);
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
        const entity = new Category();
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
