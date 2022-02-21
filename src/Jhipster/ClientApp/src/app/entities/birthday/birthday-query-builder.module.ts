import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryBuilderModule } from 'angular2-query-builder';
import { CommonModule } from '@angular/common';
import { BirthdayQueryBuilderComponent } from './birthday-query-builder.component';
import { InputTextModule } from 'primeng/inputtext';
import { RulesetNameValidatorDirective } from './birthday-query-builder.component';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, QueryBuilderModule, InputTextModule, DialogModule, DropdownModule,ButtonModule,FontAwesomeModule],
  declarations: [BirthdayQueryBuilderComponent, RulesetNameValidatorDirective],
  bootstrap: [BirthdayQueryBuilderComponent],
  exports: [BirthdayQueryBuilderComponent]
})
export class BirthdayQueryBuilderModule { }
