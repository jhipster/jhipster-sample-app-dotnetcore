import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared/util/request-util';
import { IBirthday } from 'app/shared/model/birthday.model';

type EntityResponseType = HttpResponse<IBirthday>;
type EntityArrayResponseType = HttpResponse<IBirthday[]>;

@Injectable({ providedIn: 'root' })
export class BirthdayService {
  public resourceUrl = SERVER_API_URL + 'api/birthdays';

  constructor(protected http: HttpClient) {}

  create(birthday: IBirthday): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(birthday);
    return this.http
      .post<IBirthday>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(birthday: IBirthday): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(birthday);
    return this.http
      .put<IBirthday>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IBirthday>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IBirthday[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  protected convertDateFromClient(birthday: IBirthday): IBirthday {
    const copy: IBirthday = Object.assign({}, birthday, {
      startDate: birthday.dob && birthday.dob.isValid() ? birthday.dob.toJSON() : undefined,
    });
    return copy;
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.dob = res.body.dob ? moment(res.body.dob) : undefined;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((birthday: IBirthday) => {
        birthday.dob = birthday.dob ? moment(birthday.dob) : undefined;
        const dob : any = birthday.dob;
        if (dob){
          dob.getTime = function (): Date {
            return new Date(dob.toString().substr(0,15)); // based on date without time
          };
          dob.toDateString = function(): string {
            const dobtime : any = dob.getTime();
            return dobtime.toDateString();
          };
        }        
       });
    }
    return res;
  }
}