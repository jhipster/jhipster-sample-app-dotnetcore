import { Component, OnInit, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { QueryBuilderConfig, Rule, QueryBuilderComponent } from "angular2-query-builder";
import { Directive } from '@angular/core';
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors, AsyncValidator } from '@angular/forms';
import { RulesetService } from '../ruleset/ruleset.service';
import { HttpResponse } from '@angular/common/http';
import { IRuleset, Ruleset } from 'app/shared/model/ruleset.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BirthdayQueryParserService, IQuery } from './birthday-query-parser.service';

interface RuleSet {
  condition: string;
  rules: Array<RuleSet | Rule>;
  collapsed?: boolean;
  isChild?: boolean;
  not?: boolean;
  name?: string;
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

  public query: RuleSet | null = null;

  public oDataFilter  = "hello";

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

  public rulesets : IRuleset[] = [];

  public selectingRuleset = false;

  public selectedRuleset: Ruleset | null = null;

  private BASE_URL = 'https://odatasampleservices.azurewebsites.net/V4/Northwind/Northwind.svc/';

  constructor(private formBuilder: FormBuilder, private localChangeDetectorRef:ChangeDetectorRef, private renderer : Renderer2, private rulesetService: RulesetService, private birthdayQueryParserService : BirthdayQueryParserService) {
    super(localChangeDetectorRef);
    this.queryCtrl = this.formBuilder.control(this.query); 
    this.initialize(JSON.stringify(this.query));
  }

  public initialize(query: string): void{
    this.query = JSON.parse(query);
    this.queryCtrl = this.formBuilder.control(this.query);
    this.data = this.query;
    BirthdayQueryBuilderComponent.topLevelRuleset = BirthdayQueryBuilderComponent.topLevelRuleset || this.data;
    this.queryCtrl.valueChanges.subscribe(ruleSet => {
      this.oDataFilter = `${this.BASE_URL}?$filter=${this.toODataString(ruleSet)}`;
    });
  }

  ngOnInit() : any{
    // super.ngOnInit();
    this.ngOnChanges(null as any);  // needed to initialize fields
  }

  toggleNot(el : any) : void{
    el.checked = el.checked ? false : true;
    const ruleset = this.data as RuleSet;
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
    if (!this.queryIsValid()){
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
    const ruleset : Ruleset = new Ruleset();
    ruleset.name = (this.data as any).name;
    ruleset.jsonString = JSON.stringify(this.data);
    this.subscribeToSaveRulesetResponse(this.rulesetService.create(ruleset));    
  }

  public queryIsValid() : boolean {
    const parserService = this.birthdayQueryParserService;
    const query = parserService.queryAsString(this.data as IQuery);
    if (query === ""){
      return false;
    }
    const obj : any = JSON.parse(parserService.parse(query));
    if (obj.Invalid){
      return false;
    }
    return true;
  }

  protected subscribeToSaveRulesetResponse(result: Observable<HttpResponse<IRuleset>>): void {
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

  addNamedRuleSet(): void {
    if (this.disabled) {
      return;
    }
    this.selectedRuleset = null;
    this.rulesets = [];
    const pathNames = this.getPathNames();
    this.rulesetService.query().pipe(map(res  => {
      this.rulesets = [];
      const returnedRulesets = res.body || [];
      returnedRulesets.forEach(r=>{
        if (!pathNames.includes(r.name as string)){
          this.rulesets.push(r);
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
  rulesets : IRuleset[] = [];
  constructor(private rulesetService: RulesetService ) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
      const obs = this.rulesetService.query().pipe(map(res  => {
        (this.rulesets = res.body || []);
        let bFound = false;
        this.rulesets.forEach(r =>{
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
