import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IPieceOfWork } from 'app/shared/model/piece-of-work.model';
import { PieceOfWorkService } from './piece-of-work.service';
import { PieceOfWorkDeleteDialogComponent } from './piece-of-work-delete-dialog.component';

@Component({
  selector: 'jhi-piece-of-work',
  templateUrl: './piece-of-work.component.html',
})
export class PieceOfWorkComponent implements OnInit, OnDestroy {
  pieceOfWorks?: IPieceOfWork[];
  eventSubscriber?: Subscription;

  constructor(
    protected pieceOfWorkService: PieceOfWorkService,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal
  ) {}

  loadAll(): void {
    this.pieceOfWorkService.query().subscribe((res: HttpResponse<IPieceOfWork[]>) => (this.pieceOfWorks = res.body || []));
  }

  ngOnInit(): void {
    this.loadAll();
    this.registerChangeInPieceOfWorks();
  }

  ngOnDestroy(): void {
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
  }

  trackId(index: number, item: IPieceOfWork): number {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return item.id!;
  }

  registerChangeInPieceOfWorks(): void {
    this.eventSubscriber = this.eventManager.subscribe('pieceOfWorkListModification', () => this.loadAll());
  }

  delete(pieceOfWork: IPieceOfWork): void {
    const modalRef = this.modalService.open(PieceOfWorkDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.pieceOfWork = pieceOfWork;
  }
}
