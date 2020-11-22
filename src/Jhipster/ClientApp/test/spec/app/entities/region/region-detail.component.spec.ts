import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { JhipsterTestModule } from '../../../test.module';
import { RegionDetailComponent } from 'app/entities/region/region-detail.component';
import { Region } from 'app/shared/model/region.model';

describe('Component Tests', () => {
  describe('Region Management Detail Component', () => {
    let comp: RegionDetailComponent;
    let fixture: ComponentFixture<RegionDetailComponent>;
    const route = ({ data: of({ region: new Region(123) }) } as any) as ActivatedRoute;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [RegionDetailComponent],
        providers: [{ provide: ActivatedRoute, useValue: route }],
      })
        .overrideTemplate(RegionDetailComponent, '')
        .compileComponents();
      fixture = TestBed.createComponent(RegionDetailComponent);
      comp = fixture.componentInstance;
    });

    describe('OnInit', () => {
      it('Should load region on init', () => {
        // WHEN
        comp.ngOnInit();

        // THEN
        expect(comp.region).toEqual(jasmine.objectContaining({ id: 123 }));
      });
    });
  });
});
