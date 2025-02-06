import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ITimeSheetEntry } from '../time-sheet-entry.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../time-sheet-entry.test-samples';

import { TimeSheetEntryService } from './time-sheet-entry.service';

const requireRestSample: ITimeSheetEntry = {
  ...sampleWithRequiredData,
};

describe('TimeSheetEntry Service', () => {
  let service: TimeSheetEntryService;
  let httpMock: HttpTestingController;
  let expectedResult: ITimeSheetEntry | ITimeSheetEntry[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TimeSheetEntryService);
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

    it('should create a TimeSheetEntry', () => {
      const timeSheetEntry = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(timeSheetEntry).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TimeSheetEntry', () => {
      const timeSheetEntry = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(timeSheetEntry).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TimeSheetEntry', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TimeSheetEntry', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a TimeSheetEntry', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTimeSheetEntryToCollectionIfMissing', () => {
      it('should add a TimeSheetEntry to an empty array', () => {
        const timeSheetEntry: ITimeSheetEntry = sampleWithRequiredData;
        expectedResult = service.addTimeSheetEntryToCollectionIfMissing([], timeSheetEntry);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(timeSheetEntry);
      });

      it('should not add a TimeSheetEntry to an array that contains it', () => {
        const timeSheetEntry: ITimeSheetEntry = sampleWithRequiredData;
        const timeSheetEntryCollection: ITimeSheetEntry[] = [
          {
            ...timeSheetEntry,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTimeSheetEntryToCollectionIfMissing(timeSheetEntryCollection, timeSheetEntry);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TimeSheetEntry to an array that doesn't contain it", () => {
        const timeSheetEntry: ITimeSheetEntry = sampleWithRequiredData;
        const timeSheetEntryCollection: ITimeSheetEntry[] = [sampleWithPartialData];
        expectedResult = service.addTimeSheetEntryToCollectionIfMissing(timeSheetEntryCollection, timeSheetEntry);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(timeSheetEntry);
      });

      it('should add only unique TimeSheetEntry to an array', () => {
        const timeSheetEntryArray: ITimeSheetEntry[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const timeSheetEntryCollection: ITimeSheetEntry[] = [sampleWithRequiredData];
        expectedResult = service.addTimeSheetEntryToCollectionIfMissing(timeSheetEntryCollection, ...timeSheetEntryArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const timeSheetEntry: ITimeSheetEntry = sampleWithRequiredData;
        const timeSheetEntry2: ITimeSheetEntry = sampleWithPartialData;
        expectedResult = service.addTimeSheetEntryToCollectionIfMissing([], timeSheetEntry, timeSheetEntry2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(timeSheetEntry);
        expect(expectedResult).toContain(timeSheetEntry2);
      });

      it('should accept null and undefined values', () => {
        const timeSheetEntry: ITimeSheetEntry = sampleWithRequiredData;
        expectedResult = service.addTimeSheetEntryToCollectionIfMissing([], null, timeSheetEntry, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(timeSheetEntry);
      });

      it('should return initial array if no TimeSheetEntry is added', () => {
        const timeSheetEntryCollection: ITimeSheetEntry[] = [sampleWithRequiredData];
        expectedResult = service.addTimeSheetEntryToCollectionIfMissing(timeSheetEntryCollection, undefined, null);
        expect(expectedResult).toEqual(timeSheetEntryCollection);
      });
    });

    describe('compareTimeSheetEntry', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTimeSheetEntry(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 5799 };
        const entity2 = null;

        const compareResult1 = service.compareTimeSheetEntry(entity1, entity2);
        const compareResult2 = service.compareTimeSheetEntry(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 5799 };
        const entity2 = { id: 1487 };

        const compareResult1 = service.compareTimeSheetEntry(entity1, entity2);
        const compareResult2 = service.compareTimeSheetEntry(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 5799 };
        const entity2 = { id: 5799 };

        const compareResult1 = service.compareTimeSheetEntry(entity1, entity2);
        const compareResult2 = service.compareTimeSheetEntry(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
