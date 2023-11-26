import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { PieceOfWorkService } from '../service/piece-of-work.service';

import { PieceOfWorkComponent } from './piece-of-work.component';

describe('PieceOfWork Management Component', () => {
  let comp: PieceOfWorkComponent;
  let fixture: ComponentFixture<PieceOfWorkComponent>;
  let service: PieceOfWorkService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'piece-of-work', component: PieceOfWorkComponent }]),
        HttpClientTestingModule,
        PieceOfWorkComponent,
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
      .overrideTemplate(PieceOfWorkComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PieceOfWorkComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(PieceOfWorkService);

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
    expect(comp.pieceOfWorks?.[0]).toEqual(expect.objectContaining({ id: 123 }));
  });

  describe('trackId', () => {
    it('Should forward to pieceOfWorkService', () => {
      const entity = { id: 123 };
      jest.spyOn(service, 'getPieceOfWorkIdentifier');
      const id = comp.trackId(0, entity);
      expect(service.getPieceOfWorkIdentifier).toHaveBeenCalledWith(entity);
      expect(id).toBe(entity.id);
    });
  });
});
