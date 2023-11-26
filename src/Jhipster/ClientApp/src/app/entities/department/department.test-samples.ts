import { IDepartment, NewDepartment } from './department.model';

export const sampleWithRequiredData: IDepartment = {
  id: 6858,
  departmentName: 'sentimental',
};

export const sampleWithPartialData: IDepartment = {
  id: 28293,
  departmentName: 'oh',
};

export const sampleWithFullData: IDepartment = {
  id: 10719,
  departmentName: 'cheesecake whoever',
};

export const sampleWithNewData: NewDepartment = {
  departmentName: 'data whereas next',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
