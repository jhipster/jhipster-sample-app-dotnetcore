import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { JhipsterTestModule } from '../../../test.module';
import { JobHistoryDetailComponent } from 'app/entities/job-history/job-history-detail.component';
import { JobHistory } from 'app/shared/model/job-history.model';

describe('Component Tests', () => {
  describe('JobHistory Management Detail Component', () => {
    let comp: JobHistoryDetailComponent;
    let fixture: ComponentFixture<JobHistoryDetailComponent>;
    const route = ({ data: of({ jobHistory: new JobHistory(123) }) } as any) as ActivatedRoute;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [JhipsterTestModule],
        declarations: [JobHistoryDetailComponent],
        providers: [{ provide: ActivatedRoute, useValue: route }],
      })
        .overrideTemplate(JobHistoryDetailComponent, '')
        .compileComponents();
      fixture = TestBed.createComponent(JobHistoryDetailComponent);
      comp = fixture.componentInstance;
    });

    describe('OnInit', () => {
      it('Should load jobHistory on init', () => {
        // WHEN
        comp.ngOnInit();

        // THEN
        expect(comp.jobHistory).toEqual(jasmine.objectContaining({ id: 123 }));
      });
    });
  });
});
