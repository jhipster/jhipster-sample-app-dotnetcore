import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IJobHistory } from '../job-history.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../job-history.test-samples';

import { JobHistoryService, RestJobHistory } from './job-history.service';

const requireRestSample: RestJobHistory = {
  ...sampleWithRequiredData,
  startDate: sampleWithRequiredData.startDate?.toJSON(),
  endDate: sampleWithRequiredData.endDate?.toJSON(),
};

describe('JobHistory Service', () => {
  let service: JobHistoryService;
  let httpMock: HttpTestingController;
  let expectedResult: IJobHistory | IJobHistory[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(JobHistoryService);
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

    it('should create a JobHistory', () => {
      const jobHistory = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(jobHistory).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a JobHistory', () => {
      const jobHistory = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(jobHistory).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a JobHistory', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of JobHistory', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a JobHistory', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addJobHistoryToCollectionIfMissing', () => {
      it('should add a JobHistory to an empty array', () => {
        const jobHistory: IJobHistory = sampleWithRequiredData;
        expectedResult = service.addJobHistoryToCollectionIfMissing([], jobHistory);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(jobHistory);
      });

      it('should not add a JobHistory to an array that contains it', () => {
        const jobHistory: IJobHistory = sampleWithRequiredData;
        const jobHistoryCollection: IJobHistory[] = [
          {
            ...jobHistory,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addJobHistoryToCollectionIfMissing(jobHistoryCollection, jobHistory);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a JobHistory to an array that doesn't contain it", () => {
        const jobHistory: IJobHistory = sampleWithRequiredData;
        const jobHistoryCollection: IJobHistory[] = [sampleWithPartialData];
        expectedResult = service.addJobHistoryToCollectionIfMissing(jobHistoryCollection, jobHistory);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(jobHistory);
      });

      it('should add only unique JobHistory to an array', () => {
        const jobHistoryArray: IJobHistory[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const jobHistoryCollection: IJobHistory[] = [sampleWithRequiredData];
        expectedResult = service.addJobHistoryToCollectionIfMissing(jobHistoryCollection, ...jobHistoryArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const jobHistory: IJobHistory = sampleWithRequiredData;
        const jobHistory2: IJobHistory = sampleWithPartialData;
        expectedResult = service.addJobHistoryToCollectionIfMissing([], jobHistory, jobHistory2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(jobHistory);
        expect(expectedResult).toContain(jobHistory2);
      });

      it('should accept null and undefined values', () => {
        const jobHistory: IJobHistory = sampleWithRequiredData;
        expectedResult = service.addJobHistoryToCollectionIfMissing([], null, jobHistory, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(jobHistory);
      });

      it('should return initial array if no JobHistory is added', () => {
        const jobHistoryCollection: IJobHistory[] = [sampleWithRequiredData];
        expectedResult = service.addJobHistoryToCollectionIfMissing(jobHistoryCollection, undefined, null);
        expect(expectedResult).toEqual(jobHistoryCollection);
      });
    });

    describe('compareJobHistory', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareJobHistory(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareJobHistory(entity1, entity2);
        const compareResult2 = service.compareJobHistory(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareJobHistory(entity1, entity2);
        const compareResult2 = service.compareJobHistory(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareJobHistory(entity1, entity2);
        const compareResult2 = service.compareJobHistory(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
