import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { JhipsterTestModule } from '../../../test.module';
import { PieceOfWorkComponent } from 'app/entities/piece-of-work/piece-of-work.component';
import { PieceOfWorkService } from 'app/entities/piece-of-work/piece-of-work.service';
import { PieceOfWork } from 'app/shared/model/piece-of-work.model';

describe('Component Tests', () => {
  describe('PieceOfWork Management Component', () => {
    let comp: PieceOfWorkComponent;
    let fixture: ComponentFixture<PieceOfWorkComponent>;
    let service: PieceOfWorkService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [PieceOfWorkComponent],
      })
        .overrideTemplate(PieceOfWorkComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(PieceOfWorkComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(PieceOfWorkService);
    });

    it('Should call load all on init', () => {
      // GIVEN
      const headers = new HttpHeaders().append('link', 'link;link');
      spyOn(service, 'query').and.returnValue(
        of(
          new HttpResponse({
            body: [new PieceOfWork(123)],
            headers,
          })
        )
      );

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.pieceOfWorks && comp.pieceOfWorks[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });
  });
});
