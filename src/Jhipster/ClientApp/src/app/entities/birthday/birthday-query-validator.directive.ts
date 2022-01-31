import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';
import { BirthdayQueryParserService } from '../birthday/birthday-query-parser.service';
import { IStoredRuleset } from 'app/shared/model/ruleset.model';

@Directive({
    selector: '[jhiValidateBirthdayQuery]',
    providers: [{provide: NG_VALIDATORS, useExisting: BirthdayQueryValidatorDirective, multi: true}]
})

export class BirthdayQueryValidatorDirective implements Validator {
  @Input() rulesetMap: Map<string, IStoredRuleset> = new Map<string, IStoredRuleset>();
  constructor(protected birthdayQueryParserService : BirthdayQueryParserService) {}

  validate(control: AbstractControl): any {
    if (control.value === null || control.value.length === 0){
      return null;
    }
    const json = this.birthdayQueryParserService.parse(control.value, this.rulesetMap as any);
    const validation = JSON.parse(json);      
    if (!validation.Invalid){
        return null;
    }
    return { birthdayQuery: {
            value: control.value 
        } 
    };
  }
}
