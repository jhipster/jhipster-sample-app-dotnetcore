import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { DepartmentService } from '../service/department.service';

import { DepartmentComponent } from './department.component';

describe('Department Management Component', () => {
  let comp: DepartmentComponent;
  let fixture: ComponentFixture<DepartmentComponent>;
  let service: DepartmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'department', component: DepartmentComponent }]),
        HttpClientTestingModule,
        DepartmentComponent,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              defaultSort: 'id,asc',
            }),
            queryParamMap: of(
              jest.requireActual('@angular/router').convertToParamMap({
                page: '1',
                size: '1',
                sort: 'id,desc',
              }),
            ),
            snapshot: { queryParams: {} },
          },
        },
      ],
    })
      .overrideTemplate(DepartmentComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(DepartmentComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(DepartmentService);

    const headers = new HttpHeaders();
    jest.spyOn(service, 'query').mockReturnValue(
      of(
        new HttpResponse({
          body: [{ id: 123 }],
          headers,
        }),
      ),
    );
  });

  it('Should call load all on init', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenCalled();
    expect(comp.departments?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });

  describe('trackId', () => {
    it('Should forward to departmentService', () => {
      const entity = { id: 123 };
      jest.spyOn(service, 'getDepartmentIdentifier');
      const id = comp.trackId(0, entity);
      expect(service.getDepartmentIdentifier).toHaveBeenCalledWith(entity);
      expect(id).toBe(entity.id);
    });
  });
});
