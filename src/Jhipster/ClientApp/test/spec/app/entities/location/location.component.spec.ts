import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { JhipsterTestModule } from '../../../test.module';
import { LocationComponent } from 'app/entities/location/location.component';
import { LocationService } from 'app/entities/location/location.service';
import { Location } from 'app/shared/model/location.model';

describe('Component Tests', () => {
  describe('Location Management Component', () => {
    let comp: LocationComponent;
    let fixture: ComponentFixture<LocationComponent>;
    let service: LocationService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [LocationComponent],
      })
        .overrideTemplate(LocationComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(LocationComponent);
      comp = fixture.componentInstance;
      service = fixture.debugElement.injector.get(LocationService);
    });

    it('Should call load all on init', () => {
      // GIVEN
      const headers = new HttpHeaders().append('link', 'link;link');
      spyOn(service, 'query').and.returnValue(
        of(
          new HttpResponse({
            body: [new Location(123)],
            headers,
          })
        )
      );

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(service.query).toHaveBeenCalled();
      expect(comp.locations && comp.locations[0]).toEqual(jasmine.objectContaining({ id: 123 }));
    });
  });
});
