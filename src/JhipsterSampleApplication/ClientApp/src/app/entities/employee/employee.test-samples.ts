import dayjs from 'dayjs/esm';

import { IEmployee, NewEmployee } from './employee.model';

export const sampleWithRequiredData: IEmployee = {
  id: 8899,
};

export const sampleWithPartialData: IEmployee = {
  id: 29906,
  firstName: 'Jade',
  lastName: 'Rogahn',
  email: 'Ayla_Ullrich@gmail.com',
  phoneNumber: 'furthermore joyous ah',
  salary: 9334,
};

export const sampleWithFullData: IEmployee = {
  id: 19019,
  firstName: 'Osborne',
  lastName: 'Luettgen',
  email: 'Lavern.Bartoletti-Reinger@hotmail.com',
  phoneNumber: 'vein pear short',
  hireDate: dayjs('2025-02-06T09:15'),
  salary: 21951,
  commissionPct: 30084,
};

export const sampleWithNewData: NewEmployee = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
