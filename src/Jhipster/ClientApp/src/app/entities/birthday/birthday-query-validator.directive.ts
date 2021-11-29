import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';
import { BirthdayQueryParserService } from '../birthday/birthday-query-parser.service';


@Directive({
    selector: '[jhiValidateBirthdayQuery]',
    providers: [{provide: NG_VALIDATORS, useExisting: BirthdayQueryValidatorDirective, multi: true}]
})

export class BirthdayQueryValidatorDirective implements Validator {
  constructor(
    protected birthdayQueryParserService : BirthdayQueryParserService
  ) {}

  validate(control: AbstractControl): ValidationErrors | null {
      return this.birthdayQueryValidator()(control);
  }

  birthdayQueryValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control.value === null || control.value.length === 0){
            return null;
        }
        const json = this.birthdayQueryParserService.parse(control.value);
        const validation : any = JSON.parse(json);
        if (!validation.Invalid){
            return null;
        }
        return { birthdayQuery: {
                value: control.value 
            } 
        };
    };
  }
}
