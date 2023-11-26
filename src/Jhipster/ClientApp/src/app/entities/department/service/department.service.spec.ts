import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IDepartment } from '../department.model';
import { sampleWithRequiredData, sampleWithNewData, sampleWithPartialData, sampleWithFullData } from '../department.test-samples';

import { DepartmentService } from './department.service';

const requireRestSample: IDepartment = {
  ...sampleWithRequiredData,
};

describe('Department Service', () => {
  let service: DepartmentService;
  let httpMock: HttpTestingController;
  let expectedResult: IDepartment | IDepartment[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    expectedResult = null;
    service = TestBed.inject(DepartmentService);
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

    it('should create a Department', () => {
      const department = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(department).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Department', () => {
      const department = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(department).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Department', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Department', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Department', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addDepartmentToCollectionIfMissing', () => {
      it('should add a Department to an empty array', () => {
        const department: IDepartment = sampleWithRequiredData;
        expectedResult = service.addDepartmentToCollectionIfMissing([], department);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(department);
      });

      it('should not add a Department to an array that contains it', () => {
        const department: IDepartment = sampleWithRequiredData;
        const departmentCollection: IDepartment[] = [
          {
            ...department,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addDepartmentToCollectionIfMissing(departmentCollection, department);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Department to an array that doesn't contain it", () => {
        const department: IDepartment = sampleWithRequiredData;
        const departmentCollection: IDepartment[] = [sampleWithPartialData];
        expectedResult = service.addDepartmentToCollectionIfMissing(departmentCollection, department);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(department);
      });

      it('should add only unique Department to an array', () => {
        const departmentArray: IDepartment[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const departmentCollection: IDepartment[] = [sampleWithRequiredData];
        expectedResult = service.addDepartmentToCollectionIfMissing(departmentCollection, ...departmentArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const department: IDepartment = sampleWithRequiredData;
        const department2: IDepartment = sampleWithPartialData;
        expectedResult = service.addDepartmentToCollectionIfMissing([], department, department2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(department);
        expect(expectedResult).toContain(department2);
      });

      it('should accept null and undefined values', () => {
        const department: IDepartment = sampleWithRequiredData;
        expectedResult = service.addDepartmentToCollectionIfMissing([], null, department, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(department);
      });

      it('should return initial array if no Department is added', () => {
        const departmentCollection: IDepartment[] = [sampleWithRequiredData];
        expectedResult = service.addDepartmentToCollectionIfMissing(departmentCollection, undefined, null);
        expect(expectedResult).toEqual(departmentCollection);
      });
    });

    describe('compareDepartment', () => {
      it('Should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareDepartment(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('Should return false if one entity is null', () => {
        const entity1 = { id: 123 };
        const entity2 = null;

        const compareResult1 = service.compareDepartment(entity1, entity2);
        const compareResult2 = service.compareDepartment(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey differs', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 456 };

        const compareResult1 = service.compareDepartment(entity1, entity2);
        const compareResult2 = service.compareDepartment(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('Should return false if primaryKey matches', () => {
        const entity1 = { id: 123 };
        const entity2 = { id: 123 };

        const compareResult1 = service.compareDepartment(entity1, entity2);
        const compareResult2 = service.compareDepartment(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
