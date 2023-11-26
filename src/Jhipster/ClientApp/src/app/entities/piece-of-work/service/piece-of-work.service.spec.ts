import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IPieceOfWork } from '../piece-of-work.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../piece-of-work.test-samples';

import { PieceOfWorkService } from './piece-of-work.service';

const requireRestSample: IPieceOfWork = {
  ...sampleWithRequiredData,
};

describe('PieceOfWork Service', () => {
  let service: PieceOfWorkService;
  let httpMock: HttpTestingController;
  let expectedResult: IPieceOfWork | IPieceOfWork[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(PieceOfWorkService);
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

    it('should create a PieceOfWork', () => {
      const pieceOfWork = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(pieceOfWork).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PieceOfWork', () => {
      const pieceOfWork = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(pieceOfWork).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PieceOfWork', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PieceOfWork', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PieceOfWork', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPieceOfWorkToCollectionIfMissing', () => {
      it('should add a PieceOfWork to an empty array', () => {
        const pieceOfWork: IPieceOfWork = sampleWithRequiredData;
        expectedResult = service.addPieceOfWorkToCollectionIfMissing([], pieceOfWork);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(pieceOfWork);
      });

      it('should not add a PieceOfWork to an array that contains it', () => {
        const pieceOfWork: IPieceOfWork = sampleWithRequiredData;
        const pieceOfWorkCollection: IPieceOfWork[] = [
          {
            ...pieceOfWork,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPieceOfWorkToCollectionIfMissing(pieceOfWorkCollection, pieceOfWork);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PieceOfWork to an array that doesn't contain it", () => {
        const pieceOfWork: IPieceOfWork = sampleWithRequiredData;
        const pieceOfWorkCollection: IPieceOfWork[] = [sampleWithPartialData];
        expectedResult = service.addPieceOfWorkToCollectionIfMissing(pieceOfWorkCollection, pieceOfWork);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(pieceOfWork);
      });

      it('should add only unique PieceOfWork to an array', () => {
        const pieceOfWorkArray: IPieceOfWork[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const pieceOfWorkCollection: IPieceOfWork[] = [sampleWithRequiredData];
        expectedResult = service.addPieceOfWorkToCollectionIfMissing(pieceOfWorkCollection, ...pieceOfWorkArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const pieceOfWork: IPieceOfWork = sampleWithRequiredData;
        const pieceOfWork2: IPieceOfWork = sampleWithPartialData;
        expectedResult = service.addPieceOfWorkToCollectionIfMissing([], pieceOfWork, pieceOfWork2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(pieceOfWork);
        expect(expectedResult).toContain(pieceOfWork2);
      });

      it('should accept null and undefined values', () => {
        const pieceOfWork: IPieceOfWork = sampleWithRequiredData;
        expectedResult = service.addPieceOfWorkToCollectionIfMissing([], null, pieceOfWork, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(pieceOfWork);
      });

      it('should return initial array if no PieceOfWork is added', () => {
        const pieceOfWorkCollection: IPieceOfWork[] = [sampleWithRequiredData];
        expectedResult = service.addPieceOfWorkToCollectionIfMissing(pieceOfWorkCollection, undefined, null);
        expect(expectedResult).toEqual(pieceOfWorkCollection);
      });
    });

    describe('comparePieceOfWork', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePieceOfWork(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.comparePieceOfWork(entity1, entity2);
        const compareResult2 = service.comparePieceOfWork(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.comparePieceOfWork(entity1, entity2);
        const compareResult2 = service.comparePieceOfWork(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.comparePieceOfWork(entity1, entity2);
        const compareResult2 = service.comparePieceOfWork(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
