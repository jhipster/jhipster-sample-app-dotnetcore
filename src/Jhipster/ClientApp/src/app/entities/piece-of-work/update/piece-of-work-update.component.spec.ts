import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { PieceOfWorkService } from '../service/piece-of-work.service';
import { IPieceOfWork } from '../piece-of-work.model';
import { PieceOfWorkFormService } from './piece-of-work-form.service';

import { PieceOfWorkUpdateComponent } from './piece-of-work-update.component';

describe('PieceOfWork Management Update Component', () => {
  let comp: PieceOfWorkUpdateComponent;
  let fixture: ComponentFixture<PieceOfWorkUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let pieceOfWorkFormService: PieceOfWorkFormService;
  let pieceOfWorkService: PieceOfWorkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([]), PieceOfWorkUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(PieceOfWorkUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PieceOfWorkUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    pieceOfWorkFormService = TestBed.inject(PieceOfWorkFormService);
    pieceOfWorkService = TestBed.inject(PieceOfWorkService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const pieceOfWork: IPieceOfWork = { id: 456 };

      activatedRoute.data = of({ pieceOfWork });
      comp.ngOnInit();

      expect(comp.pieceOfWork).toEqual(pieceOfWork);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPieceOfWork>>();
      const pieceOfWork = { id: 123 };
      jest.spyOn(pieceOfWorkFormService, 'getPieceOfWork').mockReturnValue(pieceOfWork);
      jest.spyOn(pieceOfWorkService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pieceOfWork });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: pieceOfWork }));
      saveSubject.complete();

      // THEN
      expect(pieceOfWorkFormService.getPieceOfWork).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(pieceOfWorkService.update).toHaveBeenCalledWith(expect.objectContaining(pieceOfWork));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPieceOfWork>>();
      const pieceOfWork = { id: 123 };
      jest.spyOn(pieceOfWorkFormService, 'getPieceOfWork').mockReturnValue({ id: null });
      jest.spyOn(pieceOfWorkService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pieceOfWork: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: pieceOfWork }));
      saveSubject.complete();

      // THEN
      expect(pieceOfWorkFormService.getPieceOfWork).toHaveBeenCalled();
      expect(pieceOfWorkService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPieceOfWork>>();
      const pieceOfWork = { id: 123 };
      jest.spyOn(pieceOfWorkService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pieceOfWork });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(pieceOfWorkService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
