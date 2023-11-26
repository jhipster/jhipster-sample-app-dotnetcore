import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IRegion } from '../region.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../region.test-samples';

import { RegionService } from './region.service';

const requireRestSample: IRegion = {
  ...sampleWithRequiredData,
};

describe('Region Service', () => {
  let service: RegionService;
  let httpMock: HttpTestingController;
  let expectedResult: IRegion | IRegion[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(RegionService);
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

    it('should create a Region', () => {
      const region = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(region).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Region', () => {
      const region = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(region).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Region', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Region', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Region', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addRegionToCollectionIfMissing', () => {
      it('should add a Region to an empty array', () => {
        const region: IRegion = sampleWithRequiredData;
        expectedResult = service.addRegionToCollectionIfMissing([], region);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(region);
      });

      it('should not add a Region to an array that contains it', () => {
        const region: IRegion = sampleWithRequiredData;
        const regionCollection: IRegion[] = [
          {
            ...region,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addRegionToCollectionIfMissing(regionCollection, region);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Region to an array that doesn't contain it", () => {
        const region: IRegion = sampleWithRequiredData;
        const regionCollection: IRegion[] = [sampleWithPartialData];
        expectedResult = service.addRegionToCollectionIfMissing(regionCollection, region);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(region);
      });

      it('should add only unique Region to an array', () => {
        const regionArray: IRegion[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const regionCollection: IRegion[] = [sampleWithRequiredData];
        expectedResult = service.addRegionToCollectionIfMissing(regionCollection, ...regionArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const region: IRegion = sampleWithRequiredData;
        const region2: IRegion = sampleWithPartialData;
        expectedResult = service.addRegionToCollectionIfMissing([], region, region2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(region);
        expect(expectedResult).toContain(region2);
      });

      it('should accept null and undefined values', () => {
        const region: IRegion = sampleWithRequiredData;
        expectedResult = service.addRegionToCollectionIfMissing([], null, region, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(region);
      });

      it('should return initial array if no Region is added', () => {
        const regionCollection: IRegion[] = [sampleWithRequiredData];
        expectedResult = service.addRegionToCollectionIfMissing(regionCollection, undefined, null);
        expect(expectedResult).toEqual(regionCollection);
      });
    });

    describe('compareRegion', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareRegion(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareRegion(entity1, entity2);
        const compareResult2 = service.compareRegion(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareRegion(entity1, entity2);
        const compareResult2 = service.compareRegion(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareRegion(entity1, entity2);
        const compareResult2 = service.compareRegion(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
