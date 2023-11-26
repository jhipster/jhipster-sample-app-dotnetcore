import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IRegion, NewRegion } from '../region.model';

export type PartialUpdateRegion = Partial<IRegion> & Pick<IRegion, 'id'>;

export type EntityResponseType = HttpResponse<IRegion>;
export type EntityArrayResponseType = HttpResponse<IRegion[]>;

@Injectable({ providedIn: 'root' })
export class RegionService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/regions');

  constructor(
    protected http: HttpClient,
    protected applicationConfigService: ApplicationConfigService,
  ) {}

  create(region: NewRegion): Observable<EntityResponseType> {
    return this.http.post<IRegion>(this.resourceUrl, region, { observe: 'response' });
  }

  update(region: IRegion): Observable<EntityResponseType> {
    return this.http.put<IRegion>(`${this.resourceUrl}/${this.getRegionIdentifier(region)}`, region, { observe: 'response' });
  }

  partialUpdate(region: PartialUpdateRegion): Observable<EntityResponseType> {
    return this.http.patch<IRegion>(`${this.resourceUrl}/${this.getRegionIdentifier(region)}`, region, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IRegion>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IRegion[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getRegionIdentifier(region: Pick<IRegion, 'id'>): number {
    return region.id;
  }

  compareRegion(o1: Pick<IRegion, 'id'> | null, o2: Pick<IRegion, 'id'> | null): boolean {
    return o1 && o2 ? this.getRegionIdentifier(o1) === this.getRegionIdentifier(o2) : o1 === o2;
  }

  addRegionToCollectionIfMissing<Type extends Pick<IRegion, 'id'>>(
    regionCollection: Type[],
    ...regionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const regions: Type[] = regionsToCheck.filter(isPresent);
    if (regions.length > 0) {
      const regionCollectionIdentifiers = regionCollection.map(regionItem => this.getRegionIdentifier(regionItem)!);
      const regionsToAdd = regions.filter(regionItem => {
        const regionIdentifier = this.getRegionIdentifier(regionItem);
        if (regionCollectionIdentifiers.includes(regionIdentifier)) {
          return false;
        }
        regionCollectionIdentifiers.push(regionIdentifier);
        return true;
      });
      return [...regionsToAdd, ...regionCollection];
    }
    return regionCollection;
  }
}
