import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ITimeSheet } from '../time-sheet.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../time-sheet.test-samples';

import { RestTimeSheet, TimeSheetService } from './time-sheet.service';

const requireRestSample: RestTimeSheet = {
  ...sampleWithRequiredData,
  timeSheetDate: sampleWithRequiredData.timeSheetDate?.format(DATE_FORMAT),
};

describe('TimeSheet Service', () => {
  let service: TimeSheetService;
  let httpMock: HttpTestingController;
  let expectedResult: ITimeSheet | ITimeSheet[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TimeSheetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find('9fec3727-3421-4967-b213-ba36557ca194').subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a TimeSheet', () => {
      const timeSheet = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(timeSheet).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TimeSheet', () => {
      const timeSheet = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(timeSheet).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TimeSheet', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TimeSheet', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a TimeSheet', () => {
      const expected = true;

      service.delete('9fec3727-3421-4967-b213-ba36557ca194').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTimeSheetToCollectionIfMissing', () => {
      it('should add a TimeSheet to an empty array', () => {
        const timeSheet: ITimeSheet = sampleWithRequiredData;
        expectedResult = service.addTimeSheetToCollectionIfMissing([], timeSheet);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(timeSheet);
      });

      it('should not add a TimeSheet to an array that contains it', () => {
        const timeSheet: ITimeSheet = sampleWithRequiredData;
        const timeSheetCollection: ITimeSheet[] = [
          {
            ...timeSheet,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTimeSheetToCollectionIfMissing(timeSheetCollection, timeSheet);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TimeSheet to an array that doesn't contain it", () => {
        const timeSheet: ITimeSheet = sampleWithRequiredData;
        const timeSheetCollection: ITimeSheet[] = [sampleWithPartialData];
        expectedResult = service.addTimeSheetToCollectionIfMissing(timeSheetCollection, timeSheet);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(timeSheet);
      });

      it('should add only unique TimeSheet to an array', () => {
        const timeSheetArray: ITimeSheet[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const timeSheetCollection: ITimeSheet[] = [sampleWithRequiredData];
        expectedResult = service.addTimeSheetToCollectionIfMissing(timeSheetCollection, ...timeSheetArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const timeSheet: ITimeSheet = sampleWithRequiredData;
        const timeSheet2: ITimeSheet = sampleWithPartialData;
        expectedResult = service.addTimeSheetToCollectionIfMissing([], timeSheet, timeSheet2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(timeSheet);
        expect(expectedResult).toContain(timeSheet2);
      });

      it('should accept null and undefined values', () => {
        const timeSheet: ITimeSheet = sampleWithRequiredData;
        expectedResult = service.addTimeSheetToCollectionIfMissing([], null, timeSheet, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(timeSheet);
      });

      it('should return initial array if no TimeSheet is added', () => {
        const timeSheetCollection: ITimeSheet[] = [sampleWithRequiredData];
        expectedResult = service.addTimeSheetToCollectionIfMissing(timeSheetCollection, undefined, null);
        expect(expectedResult).toEqual(timeSheetCollection);
      });
    });

    describe('compareTimeSheet', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTimeSheet(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' };
        const entity2 = null;

        const compareResult1 = service.compareTimeSheet(entity1, entity2);
        const compareResult2 = service.compareTimeSheet(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' };
        const entity2 = { id: 'd6f552c0-8ee7-4bb7-8593-218d779b5369' };

        const compareResult1 = service.compareTimeSheet(entity1, entity2);
        const compareResult2 = service.compareTimeSheet(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' };
        const entity2 = { id: 'dec9d8a0-409c-4f6d-b493-f7f154c53ff6' };

        const compareResult1 = service.compareTimeSheet(entity1, entity2);
        const compareResult2 = service.compareTimeSheet(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
