import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, ParamMap, Router, Data } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IBirthday } from 'app/shared/model/birthday.model';

import { ICategory } from 'app/shared/model/category.model';

import { ITEMS_PER_PAGE } from 'app/shared/constants/pagination.constants';
import { BirthdayService } from '../birthday/birthday.service';
import { CategoryService } from './category.service';
import { RulesetService } from '../ruleset/ruleset.service';
import { map } from 'rxjs/operators';
import { IStoredRuleset } from 'app/shared/model/ruleset.model';

// import { CategoryDeleteDialogComponent } from './category-delete-dialog.component';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { Table } from 'primeng/table';
import { MenuItem, MessageService } from 'primeng/api';
import { DomSanitizer } from "@angular/platform-browser";
import { ConfirmationService, PrimeNGConfig} from "primeng/api";
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { SuperTable } from '../birthday/super-table';
import { BirthdayQueryParserService } from '../birthday/birthday-query-parser.service';

interface IView {
  name: string,
  aggregation: string,
  field: string,
  query: string,
  script?: string,
  categoryQuery? : string
  focus? : IBirthday[]
  secondLevelView? : IView
  topLevelView? : IView
  topLevelCategory? : string
}

interface IQueryRule {
  field: string,
  operator: string,
  value: string
}

interface IQuery {
  condition: string,
  rules: IQueryRule[],
  not: boolean
}

@Component({
  selector: 'jhi-category',
  templateUrl: './category.component.html',
  providers: [MessageService, ConfirmationService, BirthdayQueryParserService]
})

export class CategoryComponent implements OnInit, OnDestroy {
  rulesetMap: Map<string, IQuery | IQueryRule> = new Map<string, IQuery | IQueryRule>();
  categories: ICategory[] = [];
  categoriesMap : {} = {};
  eventSubscriber?: Subscription;
  totalItems = 0;
  itemsPerPage = ITEMS_PER_PAGE;
  page!: number;
  predicate!: string;
  ascending!: boolean;
  ngbPaginationPage = 1;
  expandedRows = {};
  loading = true;
  displayAsCategories = true;
  faCheck = faCheck;
  categoriesTable: SuperTable | null = null;
  searchQueryAsString = "";
  searchQueryBeforeEdit = "";
  
  columnDefs = [
    { field: 'categoryName', sortable: true, filter: true },
  ];

  rowData = new Observable<any[]>();

  menuItems: MenuItem[] = [];

  contextSelectedRow: ICategory | null = null;

  checkboxSelectedRows : IBirthday[] = [];

  chipSelectedRows : object[] = [];

  bDisplaySearchDialog = false;

  editingQuery = false;

  bDisplayBirthday = false;

  bDisplayCategories = false;

  birthdayDialogTitle  = "";

  birthdayDialogId : any = "";

  @Input() databaseQuery = "";

  refresh:any = null;

  selectedCategories : ICategory[] = [];

  initialSelectedCategories = "";

  selectedView: IView | null = null ;

  secondLevel = false;

  @Input() firstColumnIndent = "";

  @Input() hideHeader = false;

  _parent : SuperTable | null = null;

  @Input() get parent(): SuperTable {
    return this._parent as SuperTable;
  }
  set parent(val: SuperTable){
      this._parent = val;
      const parentSelectedView = JSON.parse(JSON.stringify(val.selectedView)); // clone
      this.selectedView = parentSelectedView.secondLevelView;
      delete parentSelectedView.secondLevelView;
      (this.selectedView as IView).topLevelView = parentSelectedView;
  }

  categoryComponent: null | CategoryComponent = null;

  @Input() category : ICategory | null = null;

  @Input() parentComponent: null | CategoryComponent  = null;

  views: IView[] = [
    {name:"Category", field: "categories", aggregation: "categories.keyword", query: "categories:*"}
    ,{name:"Birth Year", field: "dob", aggregation: "dob", query: "*", categoryQuery: "dob:[{}-01-01 TO {}-12-31]", script: "\n            String st = doc['dob'].value.getYear().toString();\n            if (st==null){\n              return \"\";\n            } else {\n              return st.substring(0, 4);\n            }\n          "}
    ,{name:"Sign", field: "sign", aggregation: "sign.keyword", query: "sign:*"}
    ,{name: "First Name", field: "fname", aggregation: "fname.keyword", query: "fname:*"}
    ,{name: "Sign/Birth Year", field: "sign", aggregation: "sign.keyword", query: "sign:*", secondLevelView:{name:"Year of Birth", field: "dob", aggregation: "dob", query: "*", categoryQuery: "dob:[{}-01-01 TO {}-12-31]", script: "\n            String st = doc['dob'].value.getYear().toString();\n            if (st==null){\n              return \"\";\n            } else {\n              return st.substring(0, 4);\n            }\n          "}}
    ,{name: "Query", field: "ruleset", aggregation: "", query: "", secondLevelView:{name: "SecondLevel", field: "ruleset2", aggregation: "", query: ""}}
  ];

  constructor(
    protected categoryService: CategoryService,
    protected birthdayService: BirthdayService,
    protected activatedRoute: ActivatedRoute,
    protected router: Router,
    protected eventManager: JhiEventManager,
    protected modalService: NgbModal,
    protected messageService: MessageService,
    public sanitizer:DomSanitizer,
    private primeNGConfig : PrimeNGConfig,
    protected birthdayQueryParserService : BirthdayQueryParserService,
    private rulesetService: RulesetService
  ) {
    this.refresh = this.refreshData.bind(this);
    this.categoryComponent = this;
  }

  loadPage(page?: number, dontNavigate?: boolean): void {
    const pageToLoad: number = page || this.page || 1;
    this.loading = true;
    const viewQuery: any = this.selectedView === null ? {view: null} : {view:this.selectedView};
    if (this.selectedView && this.selectedView.topLevelView){
      this.selectedView.topLevelCategory = this.category?.notCategorized ? "-" : this.category?.categoryName;
    }
    viewQuery.query = this.databaseQuery;
    this.categoryService
      .query({
        page: pageToLoad - 1,
        size: this.itemsPerPage,
        sort: this.sort(),
        query: JSON.stringify(viewQuery)
      })
      .subscribe(
        (res: HttpResponse<ICategory[]>) => this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate),
        () => this.onError()
      );
  }

  refreshData(): void {
    this.categories =[];
    this.rowData = of(this.categories);
    if (this.categoriesTable){
      this.categoriesTable.children.length = 0;
    }
    this.loadPage();
  }

  clearFilters(table: Table, searchInput: any): void{
    searchInput.value = ""; // should clear filter
    // table.clear();
    table.reset();
    Object.keys(this.expandedRows).forEach((key)=>{
      this.expandedRows[key] = false;
    });
    // no need to clear checkboxes or chips
    // this.chipSelectedRows = [];
    // this.checkboxSelectedRows = [];
    table.filterGlobal(searchInput.value, 'contains');  // Not sure why this is necessary, but otherwise filter stays active
  }
  
  isDisplayingEllipsis(element : HTMLElement) : boolean{
    const tolerance = 3;
    return element.offsetWidth + tolerance < element.scrollWidth
  }

  showSearchDialog(queryBuilder : any) : void {
    let rulesets : IStoredRuleset[] = [];
    const rulesetMap = new Map<string, IQuery | IQueryRule>();
    this.rulesetService.query().pipe(map((res: any): void=> {
      rulesets = res.body || [];
      rulesets?.forEach(r=>{
        const query : IQuery = JSON.parse(r.jsonString as string) as IQuery;
        rulesetMap.set(r.name as string, this.birthdayQueryParserService.normalize(query));
      }); 
      let queryObject : any = this.birthdayQueryParserService.parse(this.searchQueryAsString, rulesetMap);
      if (queryObject.Invalid){
        if (this.editingQuery){
          this.searchQueryAsString = this.searchQueryBeforeEdit;
          queryObject = this.birthdayQueryParserService.parse(this.searchQueryAsString, rulesetMap);
        }
      }
      if (this.searchQueryAsString === ""){
        queryObject = {
          "condition": "and",
          "rules": [
            {
              "field": "document",
              "operator": "contains",
              "value": ""
            }
          ]
        }
      }
      queryBuilder.initialize(JSON.stringify(queryObject));
      this.bDisplaySearchDialog = true;
      this.editingQuery = false;
    })).subscribe();
  }

  cancelSearchDialog() : void {
    this.bDisplaySearchDialog = false;
 }

  editQuery() : void {
    this.rulesetService.query().pipe(map((res: any): void=> {
      ((res.body || []) as IStoredRuleset[]).forEach(r=>{
        const query : IQuery = JSON.parse(r.jsonString as string) as IQuery;
        this.rulesetMap.set(r.name as string, query);
      });
      this.editingQuery = true;
      this.searchQueryBeforeEdit = this.searchQueryAsString;
    })).subscribe();  
  }

  cancelEditQuery() : void{
    this.editingQuery = false;
    this.searchQueryAsString = this.searchQueryBeforeEdit;
  }

  acceptEditQuery() : void{
    if (this.searchQueryAsString.length === 0){
      this.databaseQuery = "";
    } else {
      this.databaseQuery = JSON.stringify(this.birthdayQueryParserService.parse(this.searchQueryAsString, this.rulesetMap));
      this.editingQuery = false;
      this.refreshData();
    }
  }

  okSearchDialog(queryBuilder : any, queryEditbox : any) : void {
    if (!queryBuilder.queryIsValid() || queryBuilder.containsDirtyNamedQueries()){
      return;
    }
    if (queryBuilder.query.rules && queryBuilder.query.rules.length === 0){
      this.databaseQuery = "";
      this.searchQueryAsString = "";
    } else {
      this.databaseQuery = JSON.stringify(queryBuilder.query);
      this.birthdayQueryParserService.simplifyQuery(queryBuilder.query as IQuery);
      if (queryBuilder.query.name){
        // top level of the query is named
        this.searchQueryAsString = queryBuilder.query.name;
      } else {
        this.searchQueryAsString = this.birthdayQueryParserService.queryAsString(queryBuilder.query as IQuery, this.rulesetMap);
      }
    }
    this.bDisplaySearchDialog = false;
    const queryObject : any = this.birthdayQueryParserService.parse(this.searchQueryAsString, this.rulesetMap);
    if (queryObject.Invalid){
      this.editingQuery = true;
      setTimeout(function() : void{
        // hack needed to turn the box red
        queryEditbox.children[0].children[0].classList.add('ng-dirty');
      }, 0);
    } else {
      this.refreshData();
    }
  }

  clearSearch(): void{
    this.searchQueryAsString = "";
    this.databaseQuery = "";
    this.refreshData();
  }

  setCategoriesTable(categoriesTable: SuperTable): void{
    this.categoriesTable = categoriesTable;
  }

  setViewFocus(focus: IBirthday): void{
    if (this.parentComponent){
      return this.parentComponent.setViewFocus(focus);
    }
    let focusView : IView = {name: 'Focus on ' + (focus.fname as string) + ' ' + (focus.lname as string), field: "", aggregation: "", query: "", focus: [focus], secondLevelView:{name:"focuses", field: "", aggregation: "", query: "", focus: [focus]}};
    this.secondLevel = true;
    if (this.views[this.views.length - 1].focus !== undefined){
      const existingFocus : IView = this.views[this.views.length - 1];
      if ((existingFocus.focus as IBirthday[]).includes(focus)){
        focusView = existingFocus; // the name already exists, so do nothing
      } else {
        focusView.name = existingFocus.name + ' and ' + (focus.fname as string) + ' ' + (focus.lname as string); 
        focusView.focus = existingFocus.focus as IBirthday[];
        focusView.focus.push(focus);
      }
      delete this.views[this.views.length - 1];
    }
    this.views.push(focusView);
    const newViews : IView[] = [];
    this.views.forEach(v=>{
      newViews.push(v);
    });
    this.views = newViews;  // replace the list of views so the dropdown sees the change
    this.selectedView = focusView;
    this.refreshData();
  }
  
  onCheckboxChange() : void {
    this.chipSelectedRows = [];
    if (this.checkboxSelectedRows.length < 3){
      this.checkboxSelectedRows.forEach((row)=>{
        this.chipSelectedRows.push(row);
      });
    }
  }

  onViewChange(event: Event, searchInput: any, categoriesTable : SuperTable): void{
    if (event){
      searchInput.value = ""; // global search must be cleared to prevent odd behavior
      categoriesTable.filter("", "global", "contains"); // reset the global filter
      Object.keys(this.expandedRows).forEach((key)=>{
        this.expandedRows[key] = false; // unexpand all
      });
      if (this.views[this.views.length - 1].focus !== undefined){
        delete this.views[this.views.length - 1]; // get rid of the focus view
      }
      const newViews : IView[] = [];
      this.views.forEach(v=>{
        newViews.push(v);
      });
      this.views = newViews; // replace the list of views so the dropdown sees the change
      this.secondLevel = this.selectedView?.secondLevelView != null;
      this.refreshData();
    }
  }

  setMenu(categoryAny : any):void{
    if (this.selectedView?.name !== "Query" && this.selectedView?.name !== "SecondLevel"){
      return;
    }
    const category = categoryAny as ICategory;
    const query: any= JSON.parse(category.jsonString as string);
    this.menuItems = [{
      label: 'Edit query '+query.name,
      icon: 'pi pi-bookmark',      
      command: ()=>{
        this.menuItems.length = this.menuItems.length + 0;
      }
    },{
      label: 'Rename query '+query.name,
      icon: 'pi pi-bookmark',      
      command: ()=>{
        this.menuItems.length = this.menuItems.length + 0;
      }
    },{
      label: 'Delete query '+query.name,
      icon: 'pi pi-bookmark',      
      command: ()=>{
        this.menuItems.length = this.menuItems.length + 0;
      }
    }];    
  }

  onMenuShow(menu : any, chips : any): void{
    // this shouldn't be necessary, but the p-menu menuleave is not firing
    const menuEl = menu.el.nativeElement.children[0];
    const chipsEl = chips.el.nativeElement.parentElement;
    let mouseOver : any = null;
    let chipsMouseOut : any = null;
    let bMouseOnMenu = false;
    const hideMenu = ()=>{
      menu.hide();
      chipsEl.removeEventListener('mouseout', chipsMouseOut);
      menuEl.removeEventListener('mouseleave', hideMenu);
      menuEl.removeEventListener('mouseover', mouseOver);
    }
    mouseOver = ()=>{
      bMouseOnMenu = true;
    }
    chipsMouseOut = ()=>{
      setTimeout(function() : void{
        if (!bMouseOnMenu){
          hideMenu();
        }
      }, 0);
    }       
    menuEl.addEventListener('mouseover', mouseOver);
    menuEl.addEventListener('mouseleave', hideMenu);
    chipsEl.addEventListener('mouseout', chipsMouseOut);
  }

  onChipClick(event: Event) : Event {
    return event;
  }
  onExpandChange(expanded : boolean) : void {
    if (expanded){
      // ignore
    }
  }

  onRemoveChip(chip : any) : void {
    if (this.expandedRows[chip.id]){
      this.expandedRows[chip.id] = false;
    }
    const newSelection : IBirthday[] = [];
    this.checkboxSelectedRows.forEach((row)=>{
      if (row.id !== chip.id){
        newSelection.push(row)
      }
    });
    this.checkboxSelectedRows = newSelection;
  }

  isSelected(key : any) : boolean {
    let ret = false;
    this.checkboxSelectedRows.forEach((row)=>{
      if (row.id === key){
        ret = true;
      }
    });
    return ret;
  }
  okCategorize() : void{
    if (this.selectedCategories.join(",") !== this.initialSelectedCategories){
      (this.contextSelectedRow as IBirthday).categories = this.selectedCategories;
      this.subscribeToSaveResponse(this.birthdayService.update(this.contextSelectedRow as IBirthday));
    }
    this.bDisplayCategories = false;
  }
  subscribeToSaveResponse(result: Observable<HttpResponse<IBirthday>>): void {
    const refresh: any = this.refresh;
    result.subscribe(
      () => {
        this.bDisplayCategories = false;
        if (this.refresh != null){
          setTimeout(()=>{
            refresh();
          },1500); // seems to require some time for elastic to catch up
        }
      },
      () => {
        // how to provide error
        this.bDisplayCategories = false;
      }
    );
  }  
  cancelCategorize() : void {
    this.bDisplayCategories = false;
  }
  ngOnInit(): void {
    this.handleNavigation();
    this.registerChangeInCategories();
    this.primeNGConfig.ripple = true;
  }
  onCategorySuccess(data: ICategory[] | null, headers: HttpHeaders) : void{
    const totalItems = Number(headers.get('X-Total-Count'));
    this.selectedCategories = [];
    this.categories = [];
    const selectedCategoryNames:string[] = [];
    if (totalItems > 0 || (data && data?.length > 0)){
      data?.forEach(r=>{
        this.categories.push(r);
        if (r.selected){
          selectedCategoryNames.push(r.categoryName as string);
        }
      });
    }
    this.initialSelectedCategories = selectedCategoryNames.join(",");
    this.bDisplayCategories = true;
  }
  doMenuView(selectedRow: any) : void {
    const selected : IBirthday = selectedRow;
    // const count = this.checkboxSelectedRows.length;
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
      /*
      const sort = (params.get('sort') ?? data['defaultSort']).split(',');
      const predicate = sort[0];
      const ascending = sort[1] === 'asc';
      if (pageNumber !== this.page || predicate !== this.predicate || ascending !== this.ascending) {
        this.predicate = predicate;
        this.ascending = ascending;
      */
        this.loadPage(pageNumber, true);
      // }
    }).subscribe();
  }
  ngOnDestroy(): void {
    if (this.eventSubscriber) {
      this.eventManager.destroy(this.eventSubscriber);
    }
  }

  trackId(index: number, item: ICategory): number {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return item.id!;
  }

  registerChangeInCategories(): void {
    this.eventSubscriber = this.eventManager.subscribe('categoryListModification', () => this.loadPage());
  }

  /* delete(category: ICategory): void {
    const modalRef = this.modalService.open(CategoryDeleteDialogComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.category = category;
  }*/

  sort(): string[] {
    const result = [this.predicate + ',' + (this.ascending ? 'asc' : 'desc')];
    if (this.predicate !== 'id') {
      result.push('id');
    }
    return result;
  }

  sortCategory(): string[] {
    const result = ['categoryName,asc'];
    result.push('id');
    return result;
  }


  protected onSuccess(data: ICategory[] | null, headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totalItems = Number(headers.get('X-Total-Count'));
    this.page = page;
    if (navigate) {
      this.router.navigate(['/category'], {
        queryParams: {
          page: this.page,
          size: this.itemsPerPage,
          sort: this.predicate + ',' + (this.ascending ? 'asc' : 'desc'),
        },
      });
    }
    this.categories = data || [];
    this.ngbPaginationPage = this.page;
    
    if (data) {
      this.rowData = of(this.categories);
    }
    this.displayAsCategories = this.categories?.length !== 1 || !!this.views[this.views.length - 1].focus || (this.selectedView !== null && this.selectedView.field.startsWith("ruleset"));
    if (this.categoriesTable != null){
      const categoriesTable = this.categoriesTable;
      setTimeout(function() : void{
        if (categoriesTable.displayingAsCategories){
          categoriesTable.filteringGlobal = true;
        }
        categoriesTable._filter();
      }, 0);
    }
    this.loading = false;
  }

  protected onError(): void {
    this.ngbPaginationPage = this.page ?? 1;
  }
}
