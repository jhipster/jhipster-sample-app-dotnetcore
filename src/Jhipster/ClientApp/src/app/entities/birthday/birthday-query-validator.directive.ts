import { Directive } from '@angular/core';
import { AbstractControl, NG_ASYNC_VALIDATORS, ValidationErrors, AsyncValidator } from '@angular/forms';
import { BirthdayQueryParserService } from '../birthday/birthday-query-parser.service';
import { RulesetService } from '../ruleset/ruleset.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { IStoredRuleset } from 'app/shared/model/ruleset.model';

@Directive({
    selector: '[jhiValidateBirthdayQuery]',
    providers: [{provide: NG_ASYNC_VALIDATORS, useExisting: BirthdayQueryValidatorDirective, multi: true}]
})

export class BirthdayQueryValidatorDirective implements AsyncValidator {
  static rulesets : IStoredRuleset[] | null = null;
  static rulesetMap: Map<string, IStoredRuleset> = new Map<string, IStoredRuleset>();
  static lastRequestTime: Date | null = null;
  constructor(protected birthdayQueryParserService : BirthdayQueryParserService,private rulesetService: RulesetService) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    const funct = (res: any): ValidationErrors | null => {
      if (!res.reuse){
        BirthdayQueryValidatorDirective.rulesets = res.body || [];
        BirthdayQueryValidatorDirective.rulesetMap = new Map<string, IStoredRuleset>();
        BirthdayQueryValidatorDirective.lastRequestTime = new Date();
      }
      BirthdayQueryValidatorDirective.rulesets?.forEach(r=>{
        BirthdayQueryValidatorDirective.rulesetMap.set(r.name as string, r);
      });
      if (control.value === null || control.value.length === 0){
        return null;
      }
      const json = this.birthdayQueryParserService.parse(control.value, BirthdayQueryValidatorDirective.rulesetMap as any);
      const validation = JSON.parse(json);      
      if (!validation.Invalid){
          return null;
      }
      return { birthdayQuery: {
              value: control.value 
          } 
      };
    }
    if (BirthdayQueryValidatorDirective.rulesets != null 
        && (new Date().getTime() - (BirthdayQueryValidatorDirective.lastRequestTime as Date)?.getTime() < 60000)){
      return of({reuse: true}).pipe(map(funct));
    }
    return this.rulesetService.query().pipe(map(funct));
  }
}
