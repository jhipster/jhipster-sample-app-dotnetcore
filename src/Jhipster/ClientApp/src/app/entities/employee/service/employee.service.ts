import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IEmployee, NewEmployee } from '../employee.model';

export type PartialUpdateEmployee = Partial<IEmployee> & Pick<IEmployee, 'id'>;

type RestOf<T extends IEmployee | NewEmployee> = Omit<T, 'hireDate'> & {
  hireDate?: string | null;
};

export type RestEmployee = RestOf<IEmployee>;

export type NewRestEmployee = RestOf<NewEmployee>;

export type PartialUpdateRestEmployee = RestOf<PartialUpdateEmployee>;

export type EntityResponseType = HttpResponse<IEmployee>;
export type EntityArrayResponseType = HttpResponse<IEmployee[]>;

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/employees');

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
  ) {}

  create(employee: NewEmployee): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(employee);
    return this.http
      .post<RestEmployee>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(employee: IEmployee): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(employee);
    return this.http
      .put<RestEmployee>(`${this.resourceUrl}/${this.getEmployeeIdentifier(employee)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(employee: PartialUpdateEmployee): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(employee);
    return this.http
      .patch<RestEmployee>(`${this.resourceUrl}/${this.getEmployeeIdentifier(employee)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestEmployee>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestEmployee[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getEmployeeIdentifier(employee: Pick<IEmployee, 'id'>): number {
    return employee.id;
  }

  compareEmployee(o1: Pick<IEmployee, 'id'> | null, o2: Pick<IEmployee, 'id'> | null): boolean {
    return o1 && o2 ? this.getEmployeeIdentifier(o1) === this.getEmployeeIdentifier(o2) : o1 === o2;
  }

  addEmployeeToCollectionIfMissing<Type extends Pick<IEmployee, 'id'>>(
    employeeCollection: Type[],
    ...employeesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const employees: Type[] = employeesToCheck.filter(isPresent);
    if (employees.length > 0) {
      const employeeCollectionIdentifiers = employeeCollection.map(employeeItem => this.getEmployeeIdentifier(employeeItem)!);
      const employeesToAdd = employees.filter(employeeItem => {
        const employeeIdentifier = this.getEmployeeIdentifier(employeeItem);
        if (employeeCollectionIdentifiers.includes(employeeIdentifier)) {
          return false;
        }
        employeeCollectionIdentifiers.push(employeeIdentifier);
        return true;
      });
      return [...employeesToAdd, ...employeeCollection];
    }
    return employeeCollection;
  }

  protected convertDateFromClient<T extends IEmployee | NewEmployee | PartialUpdateEmployee>(employee: T): RestOf<T> {
    return {
      ...employee,
      hireDate: employee.hireDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restEmployee: RestEmployee): IEmployee {
    return {
      ...restEmployee,
      hireDate: restEmployee.hireDate ? dayjs(restEmployee.hireDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestEmployee>): HttpResponse<IEmployee> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestEmployee[]>): HttpResponse<IEmployee[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
