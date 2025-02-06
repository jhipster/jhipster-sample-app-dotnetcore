import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ITimeSheet } from 'app/entities/time-sheet/time-sheet.model';
import { TimeSheetService } from 'app/entities/time-sheet/service/time-sheet.service';
import { TimeSheetEntryService } from '../service/time-sheet-entry.service';
import { ITimeSheetEntry } from '../time-sheet-entry.model';
import { TimeSheetEntryFormService } from './time-sheet-entry-form.service';

import { TimeSheetEntryUpdateComponent } from './time-sheet-entry-update.component';

describe('TimeSheetEntry Management Update Component', () => {
  let comp: TimeSheetEntryUpdateComponent;
  let fixture: ComponentFixture<TimeSheetEntryUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let timeSheetEntryFormService: TimeSheetEntryFormService;
  let timeSheetEntryService: TimeSheetEntryService;
  let timeSheetService: TimeSheetService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TimeSheetEntryUpdateComponent],
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
      .overrideTemplate(TimeSheetEntryUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TimeSheetEntryUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    timeSheetEntryFormService = TestBed.inject(TimeSheetEntryFormService);
    timeSheetEntryService = TestBed.inject(TimeSheetEntryService);
    timeSheetService = TestBed.inject(TimeSheetService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call TimeSheet query and add missing value', () => {
      const timeSheetEntry: ITimeSheetEntry = { id: 1487 };
      const timeSheet: ITimeSheet = { id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' };
      timeSheetEntry.timeSheet = timeSheet;

      const timeSheetCollection: ITimeSheet[] = [{ id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' }];
      jest.spyOn(timeSheetService, 'query').mockReturnValue(of(new HttpResponse({ body: timeSheetCollection })));
      const additionalTimeSheets = [timeSheet];
      const expectedCollection: ITimeSheet[] = [...additionalTimeSheets, ...timeSheetCollection];
      jest.spyOn(timeSheetService, 'addTimeSheetToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ timeSheetEntry });
      comp.ngOnInit();

      expect(timeSheetService.query).toHaveBeenCalled();
      expect(timeSheetService.addTimeSheetToCollectionIfMissing).toHaveBeenCalledWith(
        timeSheetCollection,
        ...additionalTimeSheets.map(expect.objectContaining),
      );
      expect(comp.timeSheetsSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const timeSheetEntry: ITimeSheetEntry = { id: 1487 };
      const timeSheet: ITimeSheet = { id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' };
      timeSheetEntry.timeSheet = timeSheet;

      activatedRoute.data = of({ timeSheetEntry });
      comp.ngOnInit();

      expect(comp.timeSheetsSharedCollection).toContainEqual(timeSheet);
      expect(comp.timeSheetEntry).toEqual(timeSheetEntry);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeSheetEntry>>();
      const timeSheetEntry = { id: 5799 };
      jest.spyOn(timeSheetEntryFormService, 'getTimeSheetEntry').mockReturnValue(timeSheetEntry);
      jest.spyOn(timeSheetEntryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeSheetEntry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: timeSheetEntry }));
      saveSubject.complete();

      // THEN
      expect(timeSheetEntryFormService.getTimeSheetEntry).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(timeSheetEntryService.update).toHaveBeenCalledWith(expect.objectContaining(timeSheetEntry));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeSheetEntry>>();
      const timeSheetEntry = { id: 5799 };
      jest.spyOn(timeSheetEntryFormService, 'getTimeSheetEntry').mockReturnValue({ id: null });
      jest.spyOn(timeSheetEntryService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeSheetEntry: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: timeSheetEntry }));
      saveSubject.complete();

      // THEN
      expect(timeSheetEntryFormService.getTimeSheetEntry).toHaveBeenCalled();
      expect(timeSheetEntryService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITimeSheetEntry>>();
      const timeSheetEntry = { id: 5799 };
      jest.spyOn(timeSheetEntryService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ timeSheetEntry });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(timeSheetEntryService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareTimeSheet', () => {
      it('Should forward to timeSheetService', () => {
        const entity = { id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' };
        const entity2 = { id: 'd6f552c0-8ee7-4bb7-8593-218d779b5369' };
        jest.spyOn(timeSheetService, 'compareTimeSheet');
        comp.compareTimeSheet(entity, entity2);
        expect(timeSheetService.compareTimeSheet).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
