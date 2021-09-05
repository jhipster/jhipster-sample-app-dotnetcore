import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryBuilderModule } from 'angular2-query-builder';
import { CommonModule } from '@angular/common';
import { BirthdayQueryBuilderComponent } from './birthday-query-builder.component';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, QueryBuilderModule],
  declarations: [BirthdayQueryBuilderComponent],
  bootstrap: [BirthdayQueryBuilderComponent],
  exports: [BirthdayQueryBuilderComponent]
})
export class BirthdayQueryBuilderModule { }
