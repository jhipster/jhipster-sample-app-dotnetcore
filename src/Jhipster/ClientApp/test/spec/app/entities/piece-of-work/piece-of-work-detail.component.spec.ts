import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { JhipsterTestModule } from '../../../test.module';
import { PieceOfWorkDetailComponent } from 'app/entities/piece-of-work/piece-of-work-detail.component';
import { PieceOfWork } from 'app/shared/model/piece-of-work.model';

describe('Component Tests', () => {
  describe('PieceOfWork Management Detail Component', () => {
    let comp: PieceOfWorkDetailComponent;
    let fixture: ComponentFixture<PieceOfWorkDetailComponent>;
    const route = ({ data: of({ pieceOfWork: new PieceOfWork(123) }) } as any) as ActivatedRoute;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [PieceOfWorkDetailComponent],
        providers: [{ provide: ActivatedRoute, useValue: route }],
      })
        .overrideTemplate(PieceOfWorkDetailComponent, '')
        .compileComponents();
      fixture = TestBed.createComponent(PieceOfWorkDetailComponent);
      comp = fixture.componentInstance;
    });

    describe('OnInit', () => {
      it('Should load pieceOfWork on init', () => {
        // WHEN
        comp.ngOnInit();

        // THEN
        expect(comp.pieceOfWork).toEqual(jasmine.objectContaining({ id: 123 }));
      });
    });
  });
});
