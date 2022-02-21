import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';
import { BirthdayQueryParserService, IQuery, IQueryRule } from './birthday-query-parser.service';

@Directive({
    selector: '[jhiValidateBirthdayQuery]',
    providers: [{provide: NG_VALIDATORS, useExisting: BirthdayQueryValidatorDirective, multi: true}]
})

export class BirthdayQueryValidatorDirective implements Validator {
  @Input() rulesetMap: Map<string, IQuery | IQueryRule> = new Map<string, IQuery | IQueryRule>();
  constructor(protected birthdayQueryParserService : BirthdayQueryParserService) {}

  validate(control: AbstractControl): any {
    if (control.value === null || control.value.length === 0){
      return null;
    }
    const validation = this.birthdayQueryParserService.parse(control.value);   
    if (!validation.Invalid){
        return null;
    }
    return { birthdayQuery: {
            value: control.value 
        } 
    };
  }
}
