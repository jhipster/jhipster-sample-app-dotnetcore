import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { JhipsterTestModule } from '../../../test.module';
import { RegionComponent } from 'app/entities/region/region.component';
import { RegionService } from 'app/entities/region/region.service';
import { Region } from 'app/shared/model/region.model';

describe('Component Tests', () => {
  describe('Region Management Component', () => {
    let comp: RegionComponent;
    let fixture: ComponentFixture<RegionComponent>;
    let service: RegionService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [RegionComponent],
      })
        .overrideTemplate(RegionComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(RegionComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(RegionService);
    });

    it('Should call load all on init', () => {
      // GIVEN
      const headers = new HttpHeaders().append('link', 'link;link');
      spyOn(service, 'query').and.returnValue(
        of(
          new HttpResponse({
            body: [new Region(123)],
            headers,
          })
        )
      );

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.regions && comp.regions[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });
  });
});
