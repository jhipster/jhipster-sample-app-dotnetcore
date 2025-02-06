import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { TimeSheetService } from '../service/time-sheet.service';
import { ITimeSheet } from '../time-sheet.model';
import { TimeSheetFormService } from './time-sheet-form.service';

import { TimeSheetUpdateComponent } from './time-sheet-update.component';

describe('TimeSheet Management Update Component', () => {
  let comp: TimeSheetUpdateComponent;
  let fixture: ComponentFixture<TimeSheetUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let timeSheetFormService: TimeSheetFormService;
  let timeSheetService: TimeSheetService;
  let employeeService: EmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TimeSheetUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(TimeSheetUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TimeSheetUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    timeSheetFormService = TestBed.inject(TimeSheetFormService);
    timeSheetService = TestBed.inject(TimeSheetService);
    employeeService = TestBed.inject(EmployeeService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call Employee query and add missing value', () => {
      const timeSheet: ITimeSheet = { id: 'd6f552c0-8ee7-4bb7-8593-218d779b5369' };
      const employee: IEmployee = { id: 1749 };
      timeSheet.employee = employee;

      const employeeCollection: IEmployee[] = [{ id: 1749 }];
      jest.spyOn(employeeService, 'query').mockReturnValue(of(new HttpResponse({ body: employeeCollection })));
      const additionalEmployees = [employee];
      const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
      jest.spyOn(employeeService, 'addEmployeeToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ timeSheet });
      comp.ngOnInit();

      expect(employeeService.query).toHaveBeenCalled();
      expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(
        employeeCollection,
        ...additionalEmployees.map(expect.objectContaining),
      );
      expect(comp.employeesSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const timeSheet: ITimeSheet = { id: 'd6f552c0-8ee7-4bb7-8593-218d779b5369' };
      const employee: IEmployee = { id: 1749 };
      timeSheet.employee = employee;

      activatedRoute.data = of({ timeSheet });
      comp.ngOnInit();

      expect(comp.employeesSharedCollection).toContainEqual(employee);
      expect(comp.timeSheet).toEqual(timeSheet);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeSheet>>();
      const timeSheet = { id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' };
      jest.spyOn(timeSheetFormService, 'getTimeSheet').mockReturnValue(timeSheet);
      jest.spyOn(timeSheetService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeSheet });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: timeSheet }));
      saveSubject.complete();

      // THEN
      expect(timeSheetFormService.getTimeSheet).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(timeSheetService.update).toHaveBeenCalledWith(expect.objectContaining(timeSheet));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeSheet>>();
      const timeSheet = { id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' };
      jest.spyOn(timeSheetFormService, 'getTimeSheet').mockReturnValue({ id: null });
      jest.spyOn(timeSheetService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeSheet: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: timeSheet }));
      saveSubject.complete();

      // THEN
      expect(timeSheetFormService.getTimeSheet).toHaveBeenCalled();
      expect(timeSheetService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeSheet>>();
      const timeSheet = { id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' };
      jest.spyOn(timeSheetService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeSheet });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(timeSheetService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareEmployee', () => {
      it('Should forward to employeeService', () => {
        const entity = { id: 1749 };
        const entity2 = { id: 1545 };
        jest.spyOn(employeeService, 'compareEmployee');
        comp.compareEmployee(entity, entity2);
        expect(employeeService.compareEmployee).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
