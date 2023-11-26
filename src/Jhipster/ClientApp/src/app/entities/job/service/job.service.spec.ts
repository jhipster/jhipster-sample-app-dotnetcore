import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IJob } from '../job.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../job.test-samples';

import { JobService } from './job.service';

const requireRestSample: IJob = {
  ...sampleWithRequiredData,
};

describe('Job Service', () => {
  let service: JobService;
  let httpMock: HttpTestingController;
  let expectedResult: IJob | IJob[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a Job', () => {
      const job = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(job).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Job', () => {
      const job = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(job).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Job', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Job', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Job', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addJobToCollectionIfMissing', () => {
      it('should add a Job to an empty array', () => {
        const job: IJob = sampleWithRequiredData;
        expectedResult = service.addJobToCollectionIfMissing([], job);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(job);
      });

      it('should not add a Job to an array that contains it', () => {
        const job: IJob = sampleWithRequiredData;
        const jobCollection: IJob[] = [
          {
            ...job,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addJobToCollectionIfMissing(jobCollection, job);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Job to an array that doesn't contain it", () => {
        const job: IJob = sampleWithRequiredData;
        const jobCollection: IJob[] = [sampleWithPartialData];
        expectedResult = service.addJobToCollectionIfMissing(jobCollection, job);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(job);
      });

      it('should add only unique Job to an array', () => {
        const jobArray: IJob[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const jobCollection: IJob[] = [sampleWithRequiredData];
        expectedResult = service.addJobToCollectionIfMissing(jobCollection, ...jobArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const job: IJob = sampleWithRequiredData;
        const job2: IJob = sampleWithPartialData;
        expectedResult = service.addJobToCollectionIfMissing([], job, job2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(job);
        expect(expectedResult).toContain(job2);
      });

      it('should accept null and undefined values', () => {
        const job: IJob = sampleWithRequiredData;
        expectedResult = service.addJobToCollectionIfMissing([], null, job, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(job);
      });

      it('should return initial array if no Job is added', () => {
        const jobCollection: IJob[] = [sampleWithRequiredData];
        expectedResult = service.addJobToCollectionIfMissing(jobCollection, undefined, null);
        expect(expectedResult).toEqual(jobCollection);
      });
    });

    describe('compareJob', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareJob(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareJob(entity1, entity2);
        const compareResult2 = service.compareJob(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareJob(entity1, entity2);
        const compareResult2 = service.compareJob(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareJob(entity1, entity2);
        const compareResult2 = service.compareJob(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
