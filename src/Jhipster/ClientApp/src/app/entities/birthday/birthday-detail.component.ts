import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IBirthday } from 'app/shared/model/birthday.model';

@Component({
  selector: 'jhi-birthday-detail',
  templateUrl: './birthday-detail.component.html',
})
export class BirthdayDetailComponent implements OnInit {
  birthday: IBirthday | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ birthday }) => (this.birthday = birthday));
  }

  previousState(): void {
    window.history.back();
  }
}
