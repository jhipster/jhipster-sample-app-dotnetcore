import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IBirthday } from 'app/shared/model/birthday.model';
import { BirthdayService } from './birthday.service';
import { BirthdayDeleteDialogComponent } from './birthday-delete-dialog.component';

@Component({
  selector: 'jhi-birthday',
  templateUrl: './birthday.component.html',
})
export class BirthdayComponent implements OnInit, OnDestroy {
  birthdays?: IBirthday[];
  eventSubscriber?: Subscription;

  constructor(protected birthdayService: BirthdayService, protected eventManager: JhiEventManager, protected modalService: NgbModal) {}

  loadAll(): void {
    this.birthdayService.query().subscribe((res: HttpResponse<IBirthday[]>) => (this.birthdays = res.body || []));
  }

  ngOnInit(): void {
    this.loadAll();
    this.registerChangeInBirthdays();
  }

  ngOnDestroy(): void {
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
  }

  trackId(index: number, item: IBirthday): number {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return item.id!;
  }

  registerChangeInBirthdays(): void {
    this.eventSubscriber = this.eventManager.subscribe('birthdayListModification', () => this.loadAll());
  }

  delete(birthday: IBirthday): void {
    const modalRef = this.modalService.open(BirthdayDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.birthday = birthday;
  }
}
