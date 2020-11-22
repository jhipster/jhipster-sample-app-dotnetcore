import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { JhipsterTestModule } from '../../../test.module';
import { DepartmentComponent } from 'app/entities/department/department.component';
import { DepartmentService } from 'app/entities/department/department.service';
import { Department } from 'app/shared/model/department.model';

describe('Component Tests', () => {
  describe('Department Management Component', () => {
    let comp: DepartmentComponent;
    let fixture: ComponentFixture<DepartmentComponent>;
    let service: DepartmentService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [DepartmentComponent],
      })
        .overrideTemplate(DepartmentComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(DepartmentComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(DepartmentService);
    });

    it('Should call load all on init', () => {
      // GIVEN
      const headers = new HttpHeaders().append('link', 'link;link');
      spyOn(service, 'query').and.returnValue(
        of(
          new HttpResponse({
            body: [new Department(123)],
            headers,
          })
        )
      );

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.departments && comp.departments[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });
  });
});
