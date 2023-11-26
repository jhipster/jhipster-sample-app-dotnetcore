import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IDepartment, NewDepartment } from '../department.model';

export type PartialUpdateDepartment = Partial<IDepartment> & Pick<IDepartment, 'id'>;

export type EntityResponseType = HttpResponse<IDepartment>;
export type EntityArrayResponseType = HttpResponse<IDepartment[]>;

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/departments');

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
  ) {}

  create(department: NewDepartment): Observable<EntityResponseType> {
    return this.http.post<IDepartment>(this.resourceUrl, department, { observe: 'response' });
  }

  update(department: IDepartment): Observable<EntityResponseType> {
    return this.http.put<IDepartment>(`${this.resourceUrl}/${this.getDepartmentIdentifier(department)}`, department, {
      observe: 'response',
    });
  }

  partialUpdate(department: PartialUpdateDepartment): Observable<EntityResponseType> {
    return this.http.patch<IDepartment>(`${this.resourceUrl}/${this.getDepartmentIdentifier(department)}`, department, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IDepartment>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IDepartment[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getDepartmentIdentifier(department: Pick<IDepartment, 'id'>): number {
    return department.id;
  }

  compareDepartment(o1: Pick<IDepartment, 'id'> | null, o2: Pick<IDepartment, 'id'> | null): boolean {
    return o1 && o2 ? this.getDepartmentIdentifier(o1) === this.getDepartmentIdentifier(o2) : o1 === o2;
  }

  addDepartmentToCollectionIfMissing<Type extends Pick<IDepartment, 'id'>>(
    departmentCollection: Type[],
    ...departmentsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const departments: Type[] = departmentsToCheck.filter(isPresent);
    if (departments.length > 0) {
      const departmentCollectionIdentifiers = departmentCollection.map(departmentItem => this.getDepartmentIdentifier(departmentItem)!);
      const departmentsToAdd = departments.filter(departmentItem => {
        const departmentIdentifier = this.getDepartmentIdentifier(departmentItem);
        if (departmentCollectionIdentifiers.includes(departmentIdentifier)) {
          return false;
        }
        departmentCollectionIdentifiers.push(departmentIdentifier);
        return true;
      });
      return [...departmentsToAdd, ...departmentCollection];
    }
    return departmentCollection;
  }
}
