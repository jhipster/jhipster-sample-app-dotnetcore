import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { QueryBuilderConfig, Rule, QueryBuilderComponent } from "angular2-query-builder";

interface RuleSet {
  condition: string;
  rules: Array<RuleSet | Rule>;
  collapsed?: boolean;
  isChild?: boolean;
  not?: boolean;
}

@Component({
  selector: 'jhi-birhday-query-builder',
  templateUrl: './birthday-query-builder.component.html',
  styleUrls: ['./birthday-query-builder-component.scss']
})

export class BirthdayQueryBuilderComponent extends QueryBuilderComponent implements OnInit {
  
  public static firstTimeDiv : any = null;

  public queryCtrl: FormControl;

  public allowCollapse = true;

  public query: RuleSet = {
    "condition": "or",
    "rules": [
      {
        "condition": "and",
        "not": false,
        "rules": [
          {
            "field": "sign",
            "operator": "=",
            "value": "sagittarius"
          },
          {
            "field": "dob",
            "operator": ">",
            "value": "1975-01-01"
          }
        ]
      },
      {
        "condition": "and",
        "not": false,
        "rules": [
          {
            "field": "dob",
            "operator": "<=",
            "value": "1493-01-01"
          }
        ]
      }
    ]
  };

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
      lname: { name: 'Last Name', type: 'string' },
      fname: { name: 'First Name', type: 'string' },
      isAlive: { name: 'Alive?', type: 'boolean' },
      dob: {
        name: 'Birthday', type: 'date', operators: ['=', '<=', '>'],
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

  private BASE_URL = 'https://odatasampleservices.azurewebsites.net/V4/Northwind/Northwind.svc/';

  private localChangeDetectorRef? : ChangeDetectorRef;

   constructor(private formBuilder: FormBuilder, ref:ChangeDetectorRef) {
    super(ref); 
    this.localChangeDetectorRef = ref;
    this.queryCtrl = this.formBuilder.control(this.query);
    this.data = this.query;
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
    this.localChangeDetectorRef?.markForCheck();
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

  FirstInstance(el : HTMLElement) : boolean{
    if (!BirthdayQueryBuilderComponent.firstTimeDiv){
      BirthdayQueryBuilderComponent.firstTimeDiv = el;
    }
    return el.isSameNode(BirthdayQueryBuilderComponent.firstTimeDiv);
  }

  private toODataString(ruleSet: RuleSet): string {
    return this.toOdataFilter(ruleSet, true);
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
  
}