import { Component, OnInit, ChangeDetectorRef, Renderer2, Input } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { QueryBuilderConfig, QueryBuilderComponent, RuleSet } from "angular2-query-builder";
import { Directive } from '@angular/core';
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors, AsyncValidator } from '@angular/forms';
import { RulesetService } from '../ruleset/ruleset.service';
import { HttpResponse } from '@angular/common/http';
import { IStoredRuleset, StoredRuleset } from 'app/shared/model/ruleset.model';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BirthdayQueryParserService, IQuery, IQueryRule } from './birthday-query-parser.service';

export interface ExtendedRuleSet extends RuleSet {
  not?: boolean;
  name?: string;
  initialQueryAsString?: string;
  usedBy?: Array<string>;
  dirty?: boolean;
}

@Component({
  selector: 'jhi-birthday-query-builder',
  templateUrl: './birthday-query-builder.component.html',
  styleUrls: ['./birthday-query-builder-component.scss']
})

export class BirthdayQueryBuilderComponent extends QueryBuilderComponent implements OnInit {
  
  public static firstTimeDiv : any = null;

  public static topLevelRuleset: RuleSet;

  public queryCtrl: FormControl;
  
  public allowCollapse = true;

  public hoveringOverButton = false;

  public editingRulesetName = false;

  private oldRulesetName : string | undefined;

  public query: RuleSet = {condition:"", rules:[]};

  public oDataFilter  = "hello";

  public updatingNamedQuery = false;

  public namedQuery = "";

  public updatingNamedQueryError = "";

  data: ExtendedRuleSet | null = null;

  odataFilters = {
    eq: 'eq',
    neq: 'ne',
    gt: 'gt',
    gte: 'ge',
    lt: 'lt',
    lte: 'le',
    contains: 'substringof',
    doesnotcontain: 'substringof',
    endswith: 'endswith',
    startswith: 'startswith',
    isnull: 'eq',
    isnotnull: 'ne',
    isempty: 'eq',
    isnotempty: 'ne',
  };
  
  odataFiltersVersionFour = {
    eq: 'eq',
    '=': 'eq',
  
    neq: 'ne',
    '!=': 'ne',
  
    gt: 'gt',
    '>': 'gt',
  
    gte: 'ge',
    '>=': 'ge',
  
    lt: 'lt',
    '<': 'lt',
  
    lte: 'le',
    '<=': 'le',
  
    like: 'contains',
  
    doesnotcontain: 'substringof',
    endswith: 'endswith',
    startswith: 'startswith',
    isnull: 'eq',
    'is null': 'eq',
    isnotnull: 'ne',
    isempty: 'eq',
    isnotempty: 'ne',
    contains: 'contains',
  };

  public config: QueryBuilderConfig = {
    fields: {
      document: { name: 'Document', type: 'string', operators: ["contains"]},
      lname: { name: 'Last Name', type: 'string' },
      fname: { name: 'First Name', type: 'string' },
      isAlive: { name: 'Alive?', type: 'boolean' },
      categories: { name: 'Category', type: 'string', operators: ["contains", "is null", "is not null"]},
      dob: {
        name: 'Birthday', type: 'date', operators: ['=', '<=', '>', '<', '<='],
        defaultValue: (() => new Date())
      },
      sign: {
        name: 'Astrological Sign',
        type: 'category',
        options: [
          { name: 'Aries', value: 'aries' },
          { name: 'Taurus', value: 'taurus' },
          { name: 'Gemini', value: 'gemini' },
          { name: 'Cancer', value: 'cancer' },
          { name: 'Leo', value: 'leo' },
          { name: 'Virgo', value: 'virgo' },
          { name: 'Libra', value: 'libra' },
          { name: 'Scorpio', value: 'scorpio' },
          { name: 'Sagittarius', value: 'sagittarius' },
          { name: 'Capricorn', value: 'capricorn' },
          { name: 'Aquarius', value: 'aquarius' },
          { name: 'Pisces    ', value: 'pisces' }      
        ]
      }
    }
  };

  public storedRulesets : IStoredRuleset[] = [];

  public selectingRuleset = false;

  public selectedRuleset: StoredRuleset | null = null;

  private BASE_URL = 'https://odatasampleservices.azurewebsites.net/V4/Northwind/Northwind.svc/';

  public namedQueryUsedIn : string[] = [];

  @Input() public sublevel = false;

  @Input() public rulesetMap : Map<string, IQuery | IQueryRule> = new Map<string, IQuery | IQueryRule>();

  constructor(private formBuilder: FormBuilder, private localChangeDetectorRef:ChangeDetectorRef, private renderer : Renderer2, private rulesetService: RulesetService, private birthdayQueryParserService : BirthdayQueryParserService) {
    super(localChangeDetectorRef);
    this.queryCtrl = this.formBuilder.control(this.query); 
    this.initialize(JSON.stringify(this.query));
  }

  public initialize(query: string): void{
    this.query = this.birthdayQueryParserService.normalize(JSON.parse(query));
    this.queryCtrl = this.formBuilder.control(this.query);
    this.data = this.query;
    BirthdayQueryBuilderComponent.topLevelRuleset = BirthdayQueryBuilderComponent.topLevelRuleset || this.data;
    this.queryCtrl.valueChanges.subscribe(ruleSet => {
      this.oDataFilter = `${this.BASE_URL}?$filter=${this.toODataString(ruleSet)}`;
    });
    setTimeout(()=>{                           // <<<---using ()=> syntax
      if (!this.sublevel){
        BirthdayQueryBuilderComponent.topLevelRuleset = this.data as RuleSet;
      }
    }, 0);    
  }

  ngOnInit() : any{
    // super.ngOnInit();
    this.ngOnChanges(null as any);  // needed to initialize fields
  }

  toggleNot(el : any) : void{
    el.checked = el.checked ? false : true;
    const ruleset = this.data as ExtendedRuleSet;
    ruleset.not = el.checked;
    this.localChangeDetectorRef.markForCheck();
    if (this.onChangeCallback) {
      this.onChangeCallback();
    }
    if (this.parentChangeCallback) {
      this.parentChangeCallback();
    }
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    if (this.parentTouchedCallback) {
      this.parentTouchedCallback();
    }
  }

  calcButtonDisplay(el : HTMLElement) : boolean {
    this.renderer.setStyle(el.children[0], 'display', (this.hoveringOverButton || (el.children[0].children[0] as any).checked) ? "block" : "none");
    const multipleChildren = this.data && this.data.rules.length > 1;
    this.renderer.setStyle(el.children[1], 'display', (this.hoveringOverButton || ((el.children[1].children[0] as any).checked && multipleChildren)) ? "block" : "none");
    this.renderer.setStyle(el.children[2], 'display', (this.hoveringOverButton || ((el.children[2].children[0] as any).checked && multipleChildren)) ? "block" : "none");
    this.renderer.setStyle(el.children[3], 'display', (this.hoveringOverButton || (el.children[0].children[0] as any).checked || multipleChildren) ? "none" : "block");
    return true;
  }

  FirstInstance(el : HTMLElement) : boolean{
    if (!BirthdayQueryBuilderComponent.firstTimeDiv){
      BirthdayQueryBuilderComponent.firstTimeDiv = el;
    }
    return el.isSameNode(BirthdayQueryBuilderComponent.firstTimeDiv);
  }

  private toODataString(ruleSet: RuleSet): string {
    return this.toOdataFilter(ruleSet, true);
  }

  public editRulesetName() : void {
    if (!this.queryIsValid() || this.data?.name){
      return;
    }
    const ruleset = this.data as RuleSet;
    this.oldRulesetName = ruleset.name;
    ruleset.name = ruleset.name || "";
    this.editingRulesetName = true;
  }

  public cancelEditRulesetName() : void {
    const ruleset = this.data as RuleSet;
    ruleset.name = this.oldRulesetName;
    this.editingRulesetName = false;
    
  }

  public acceptRulesetName() : void {
    const storedRuleset :StoredRuleset = new StoredRuleset();
    storedRuleset.name = (this.data as any).name;
    storedRuleset.jsonString = JSON.stringify(this.data);
    this.subscribeToSaveRulesetResponse(this.rulesetService.create(storedRuleset));
    this.rulesetMap.set((this.data as any).name as string, this.birthdayQueryParserService.normalize(this.data as IQuery));
  }

  public undoQueryMods(event: Event) : void {
    event.stopPropagation();
    const obj : ExtendedRuleSet = this.birthdayQueryParserService.parse(this.data?.initialQueryAsString as string);
    const query = this.data as ExtendedRuleSet;
    query.condition = obj.condition;
    query.dirty = false;
    query.not = obj.not;
    query.rules = obj.rules;
  }

  public onUpdateNamedQuery(event: Event): void{
    event.stopPropagation();
    this.namedQuery = (this.data as ExtendedRuleSet).name as string;
    this.namedQueryUsedIn = [];
    this.rulesetMap.forEach((value: any, key: string) => {
      if (key !== this.namedQuery){ 
        const namedQuery = value as IQuery;
        if (this.containsNamedRule(namedQuery, this.namedQuery) && !this.namedQueryUsedIn.includes(namedQuery.name as string)){
          this.namedQueryUsedIn.push(namedQuery.name as string);
        }
      }
    });
    this.updatingNamedQuery = true;
  }

  private containsNamedRule(query: IQuery, key: string):boolean{
    let ret = false;
    query.rules.forEach((r)=>{
      const testQuery: IQuery = r as any as IQuery;
      if (testQuery.rules){
        if (testQuery.name === key){
          ret = ret || true;
        }
        if (this.containsNamedRule(testQuery, key)){
          ret = ret || true;
        }
      }
    });
    return ret;
  }

  public onCancelSavingNamedQuery(): void{
    this.updatingNamedQuery = false;
  }

  public onRemoveNameFromQuery(): void{
    delete (this.data as ExtendedRuleSet).name;
    this.updatingNamedQuery = false;
  }

  public onConfirmUpdatingNamedQuery(): void{
    const queryAsString = this.birthdayQueryParserService.queryAsString(this.data as IQuery); 
    let jsonString = JSON.stringify(this.data as ExtendedRuleSet);
    let updated : ExtendedRuleSet = JSON.parse(jsonString); // clone
    updated.initialQueryAsString = queryAsString;
    delete updated.dirty;
    delete updated.collapsed;
    jsonString = JSON.stringify(updated);
    updated = JSON.parse(jsonString) as ExtendedRuleSet;
    for (let i = 0; i < updated.rules.length; i++){
      if ((updated.rules[i] as IQuery).rules){
        updated.rules[i] = this.birthdayQueryParserService.normalize(updated.rules[i] as IQuery);
      }
    }
    const original: IQuery  = this.rulesetMap.get(updated.name as string) as IQuery;
    original.condition = updated.condition;
    original.not = updated.not as boolean;
    original.rules = updated.rules as IQueryRule[];
    let storedRuleset = new StoredRuleset(undefined, original.name, jsonString);
    this.updatingNamedQueryError = "";
    const updateSuccess = ()  => {
      if (this.namedQueryUsedIn.length > 0){
        const namedQueryToBeUpdated = this.rulesetMap.get(this.namedQueryUsedIn.pop() as string) as IQuery;
        jsonString = JSON.stringify(namedQueryToBeUpdated);
        storedRuleset = new StoredRuleset(undefined, namedQueryToBeUpdated.name, jsonString);
        this.rulesetService.update(storedRuleset).pipe(map(updateSuccess),catchError(updateError)).subscribe();
      } else {
        (this.data as ExtendedRuleSet).initialQueryAsString = queryAsString;
        this.updatingNamedQuery = false;
      }
    };
    const updateError = (error: any) => {
      // server error from the update
      this.updatingNamedQueryError = error.error?.detail;
      return of([]);
    };
    this.rulesetService.update(storedRuleset).pipe(map(updateSuccess), catchError(updateError)).subscribe();
  }

  public containsDirtyNamedQueries(): boolean{
    return this.containsDirtyNamedQuery(this.data);
  }

  public containsDirtyNamedQueriesBelow(): boolean{
    const fakeRuleset = {rules: (this.data as ExtendedRuleSet).rules}
    return this.containsDirtyNamedQuery(fakeRuleset);
  }

  public queryIsValid() : boolean {
    const parserService = this.birthdayQueryParserService;
    const query = parserService.queryAsString(this.data as IQuery);
    const queryObject = this.data as ExtendedRuleSet;
    if (queryObject.name && !queryObject.initialQueryAsString){
      queryObject.initialQueryAsString = query;
    }
    queryObject.dirty = queryObject.initialQueryAsString !== query;
    if (query === ""){
      return false;
    }
    const obj : IQuery = parserService.parse(query);
    return !obj.Invalid;
  }

  public containsDirtyNamedQuery(rule : any): boolean{
    if (!rule.rules){
      return false; // not a ruleset
    }
    const query : ExtendedRuleSet = rule as ExtendedRuleSet;
    if (query.name && query.dirty){
      return true;
    }
    let bDirty = false;
    query.rules.forEach(r=>{
      if (this.containsDirtyNamedQuery(r)){
        bDirty = true;
      }
    });
    return bDirty;
  }

  protected subscribeToSaveRulesetResponse(result: Observable<HttpResponse<IStoredRuleset>>): void {
    result.subscribe(
      () => this.onSaveRulesetSuccess(),
      () => this.onSaveRulesetError()
    );
  }
  
  protected onSaveRulesetSuccess(): void {
    this.editingRulesetName = false;
  }

  protected onSaveRulesetError(): void {
    this.editingRulesetName = false;
  }

  toOdataFilter(filter: any, useOdataFour: boolean): any {
    // console.log('filter',filter);

    if (filter == null) return 'null';

    const result = [],
      condition = filter.condition || 'and';
    let idx,
      length,
      field,
      format,
      operator,
      value,
      ignoreCase;
      const rules = filter.rules;

    // console.log('condition',condition);
    for (idx = 0, length = rules.length; idx < length; idx++) {
      filter = rules[idx];
      field = filter.field;
      value = filter.value;
      operator = filter.operator;
      if (filter.rules) {
        filter = this.toOdataFilter(filter, useOdataFour);
      } else {
        ignoreCase = filter.ignoreCase;
        field = field.replace(/\./g, '/');
        filter = this.odataFilters[operator];
        if (useOdataFour) {
          filter = this.odataFiltersVersionFour[operator];
        }
        // console.log('f', filter);
        // console.log('o', operator);
        if (operator === 'isnull' || operator === 'is null' ||operator === 'isnotnull') {
          filter = `${field} ${filter} null`;
          // filter = `${this.BASE_URL}&$count=true`;
        } else if (operator === 'isempty' || operator === 'isnotempty') {
          filter = `${field} ${filter} ''`;
        } else if (filter && value !== undefined) {
          const type : any = typeof value;
          if (type === 'string') {
            format = "'{1}'";
            value = value.replace(/'/g, "''");
            if (ignoreCase === true) {
              field = 'tolower(' + field + ')';
            }
          } else if (type === 'date') {
            // console.log('date');
            // if (useOdataFour) {
            //  format = '{1:yyyy-MM-ddTHH:mm:ss+00:00}';
            //  value = k.timezone.apply(value, 'Etc/UTC');
            // } else {
            format = "datetime'{1:yyyy-MM-ddTHH:mm:ss}'";
            // }
          } else {
            format = '{1}';
          }
          if (filter.length > 3) {
            if (filter !== 'substringof') {
              format = '{0}({2},' + format + ')';
            } else {
              format = '{0}(' + format + ',{2})';
              if (operator === 'doesnotcontain') {
                if (useOdataFour) {
                  format = "{0}({2},'{1}') eq -1";
                  filter = 'indexof';
                } else {
                  format += ' eq false';
                }
              }
            }
          } else {
            format = '{2} {0} ' + format;
          }
          // todo fix
          filter = this.StringFormat(format, filter, value, field);
          // console.log('format', format);
          // console.log('filter', filter);
          // console.log('value', value);
          // console.log('field', field);
        }
      }
      result.push(filter);
    }
    filter = result.join(' ' + condition + ' ');
    if (result.length > 1) {
      filter = '(' + filter + ')';
    }
    return filter;
  }

  StringFormat= function (arg1 : string, arg2 : string, arg3 : string, arg4 : string) : any  {
    // The string containing the format items (e.g. "{0}")
    // will and always has to be the first argument.
    let theString = arg1;
    const args = [arg1, arg2, arg3, arg4];
    // start with the second argument (i = 1)
    for (let i = 1; i < args.length; i++) {
        // "gm" = RegEx options for Global search (more than one instance)
        // and for Multiline search
        const regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
        theString = theString.replace(regEx, args[i]);
    }
    return theString;
  }

  convertToRuleset(rule: any, data: RuleSet): void {
    if (this.disabled) {
      return;
    }
    const rules = data.rules;
    data.rules = [];
    rules.forEach(r =>{
      if (r === rule){
        data.rules.push({ condition: 'and', rules: [rule] })
      } else {
        data.rules.push(r);
      }
    });
    this.localChangeDetectorRef.markForCheck();
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    if (this.parentTouchedCallback) {
      this.parentTouchedCallback();
    } 
  }

  addNamedRuleSet(): void {
    if (this.disabled) {
      return;
    }
    this.selectedRuleset = null;
    this.storedRulesets = [];
    const pathNames = this.getPathNames();
    this.rulesetService.query().pipe(map(res  => {
      this.storedRulesets = [];
      const returnedRulesets = res.body || [];
      returnedRulesets.forEach(r=>{
        if (!pathNames.includes(r.name as string)){
          this.storedRulesets.push(r);
        }
      });
      this.selectingRuleset = true;
    })).subscribe();
  }

  getPathNames() : string[]{
    // this routine iterates up the tree
    const pathNames : string[] = [];
    let pathData : RuleSet | null = this.data;
    let looping = true;
    while (looping){
      if (pathData?.name){
        pathNames.push(pathData.name);
      }
      if (pathData === BirthdayQueryBuilderComponent.topLevelRuleset){
         looping = false;
      } else {
        pathData = this.getParentData(pathData as RuleSet, BirthdayQueryBuilderComponent.topLevelRuleset);
      }
    }
    return pathNames;
  }

  getParentData(data : RuleSet, level : RuleSet) : RuleSet | null{
    // this routine goes down the tree to find the parent of data
    let ret : RuleSet | null = null;
    level.rules.forEach(r=>{
      if (r === data){
        ret = level;
      } else if ((r as any).rules){
        const levelParent = this.getParentData(data, r as RuleSet);
        if (levelParent){
          ret = levelParent;
        }
      }
    });
    return ret;
  }

  onClearSelectingRuleset():void{
    this.selectingRuleset = false;
  }

  onRulesetSelected():void{
    this.selectingRuleset = false;
    const parent = this.data;
    (parent as RuleSet).rules = (parent as RuleSet).rules.concat([JSON.parse(this.selectedRuleset?.jsonString as string)]);
    this.localChangeDetectorRef.markForCheck();
    if (this.onChangeCallback) {
      this.onChangeCallback();
    }
    if (this.parentChangeCallback) {
      this.parentChangeCallback();
    }
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    if (this.parentTouchedCallback) {
      this.parentTouchedCallback();
    }    
  }
}

@Directive({
  selector: '[jhiValidateRulesetName]',
  providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: RulesetNameValidatorDirective, multi: true}]
})

export class RulesetNameValidatorDirective implements AsyncValidator {
  storedRulesets : IStoredRuleset[] = [];
  constructor(private rulesetService: RulesetService ) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
      const obs = this.rulesetService.query().pipe(map(res  => {
        (this.storedRulesets = res.body || []);
        let bFound = false;
        this.storedRulesets.forEach(r =>{
          if (r.name === control.value){
            bFound = true;
          }
        });
        if (bFound){
          return {
            error: "Name already used"
          }
        }
        if (/^[A-Z][A-Z_\d]*$/.test(control.value)){
          return null;
        }
        return {
          error: "Invalid name"
        };
      }));
      return obs;
  }
}
