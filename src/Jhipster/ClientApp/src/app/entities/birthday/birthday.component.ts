import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router, Data } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IBirthday } from 'app/shared/model/birthday.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { BirthdayService } from './birthday.service';
// import { BirthdayDeleteDialogComponent } from './birthday-delete-dialog.component';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
  selector: 'jhi-birthday',
  templateUrl: './birthday.component.html',
  providers: [MessageService]
})
export class BirthdayComponent implements OnInit, OnDestroy {
  birthdays?: IBirthday[];
  eventSubscriber?: Subscription;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page!: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;

  columnDefs = [
    { field: 'lname', sortable: true, filter: true },
    { field: 'fname', sortable: true, filter: true },
  { field: 'dob', sortable: true, filter: true/* , valueFormatter: (data: any) => this.formatMediumPipe.transform(dayjs(data.value)) */},
    { field: 'additional', headerName: 'sign', sortable: true, filter: true },
    { field: 'isAlive', sortable: true, filter: true },
  ];

  rowData = new Observable<any[]>();

  menuItems: MenuItem[] = [];

  selectedRow: any;
  // rowData = new Observable<IBirthday[]>();
  /*
  rowData = [
    { lname: 'Toyota', fname: 'Celica', dob: '2021-05-14T04:00:00.000Z' },
    { lname: 'Ford', fname: 'Mondeo', dob: '2021-05-14T04:00:00.000Z' },
    { lname: 'Porsche', fname: 'Boxter', dob: '2021-05-14T04:00:00.000Z' }
  ];
  */


  constructor(
    protected birthdayService: BirthdayService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected messageService: MessageService
  ) {}

  loadPage(page?: number, dontNavigate?: boolean): void {
    const pageToLoad: number = page || this.page || 1;

    this.birthdayService
      .query({
        page: pageToLoad - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
      })
      .subscribe(
        (res: HttpResponse<IBirthday[]>) => this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate),
        () => this.onError()
      );
  }

  clearFilters(table: Table, searchInput: any): void{
    searchInput.value = "";
    // table.clear();
    table.reset();
  }

  ngOnInit(): void {
    this.handleNavigation();
    this.registerChangeInBirthdays();
    this.menuItems = [
      {label: 'View', icon: 'pi pi-fw pi-search', command: () => this.doMenuView(this.selectedRow)},
          {label: 'Delete', icon: 'pi pi-fw pi-times', command: () => this.doMenuDelete(this.selectedRow)}
    ];    
  }

  doMenuView(selectedRow: any) : void {
    const selected : IBirthday = selectedRow;
    this.messageService.add({severity: 'success', summary: 'Row Viewed', detail: selected.lname });
  }

  doMenuDelete(selectedRow: any) : void {
    const selectedRowType : string = selectedRow.constructor.name;
    this.messageService.add({severity: 'success', summary: 'Row Deleted', detail: selectedRowType});
}

  protected handleNavigation(): void {
    combineLatest(this.activatedRoute.data, this.activatedRoute.queryParamMap, (data: Data, params: ParamMap) => {
      const page = params.get('page');
      const pageNumber = page !== null ? +page : 1;
      const sort = (params.get('sort') ?? data['defaultSort']).split(',');
      const predicate = sort[0];
      const ascending = sort[1] === 'asc';
      if (pageNumber !== this.page || predicate !== this.predicate || ascending !== this.ascending) {
        this.predicate = predicate;
        this.ascending = ascending;
        this.loadPage(pageNumber, true);
      }
    }).subscribe();
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
    this.eventSubscriber = this.eventManager.subscribe('birthdayListModification', () => this.loadPage());
  }

  /* delete(birthday: IBirthday): void {
    const modalRef = this.modalService.open(BirthdayDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.birthday = birthday;
  }*/

  sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  protected onSuccess(data: IBirthday[] | null, headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.page = page;
    if (navigate) {
      this.router.navigate(['/birthday'], {
        queryParams: {
          page: this.page,
          size: this.itemsPerPage,
          sort: this.predicate + ',' + (this.ascending ? 'asc' : 'desc'),
        },
      });
    }
    this.birthdays = data || [];
    this.ngbPaginationPage = this.page;
    
    if (data) {
      this.rowData = of(this.birthdays);
    }
    
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page ?? 1;
  }
}
