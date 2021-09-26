import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { JhipsterTestModule } from '../../../test.module';
import { CategoryComponent } from 'app/entities/category/category.component';
import { CategoryService } from 'app/entities/category/category.service';
import { Category } from 'app/shared/model/category.model';

describe('Component Tests', () => {
  describe('Category Management Component', () => {
    let comp: CategoryComponent;
    let fixture: ComponentFixture<CategoryComponent>;
    let service: CategoryService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [CategoryComponent],
      })
        .overrideTemplate(CategoryComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(CategoryComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(CategoryService);
    });

    it('Should call load all on init', () => {
      // GIVEN
      const headers = new HttpHeaders().append('link', 'link;link');
      spyOn(service, 'query').and.returnValue(
        of(
          new HttpResponse({
            body: [new Category(123)],
            headers,
          })
        )
      );

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.categories && comp.categories[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });
  });
});
