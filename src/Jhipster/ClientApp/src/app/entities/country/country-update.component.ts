import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ICountry, Country } from 'app/shared/model/country.model';
import { CountryService } from './country.service';
import { ICategory } from 'app/shared/model/category.model';
import { CategoryService } from 'app/entities/category/category.service';

@Component({
  selector: 'jhi-country-update',
  templateUrl: './country-update.component.html',
})
export class CountryUpdateComponent implements OnInit {
  isSaving = false;
  categories: ICategory[] = [];

  editForm = this.fb.group({
    id: [],
    countryName: [],
    categoryId: [],
  });

  constructor(
    protected countryService: CountryService,
    protected categoryService: CategoryService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ country }) => {
      this.updateForm(country);

      this.categoryService
        .query({ filter: 'country-is-null' })
        .pipe(
          map((res: HttpResponse<ICategory[]>) => {
            return res.body || [];
          })
        )
        .subscribe((resBody: ICategory[]) => {
          if (!country.categoryId) {
            this.categories = resBody;
          } else {
            this.categoryService
              .find(country.categoryId)
              .pipe(
                map((subRes: HttpResponse<ICategory>) => {
                  return subRes.body ? [subRes.body].concat(resBody) : resBody;
                })
              )
              .subscribe((concatRes: ICategory[]) => (this.categories = concatRes));
          }
        });
    });
  }

  updateForm(country: ICountry): void {
    this.editForm.patchValue({
      id: country.id,
      countryName: country.countryName,
      categoryId: country.categoryId,
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const country = this.createFromForm();
    if (country.id !== undefined) {
      this.subscribeToSaveResponse(this.countryService.update(country));
    } else {
      this.subscribeToSaveResponse(this.countryService.create(country));
    }
  }

  private createFromForm(): ICountry {
    return {
      ...new Country(),
      id: this.editForm.get(['id'])!.value,
      countryName: this.editForm.get(['countryName'])!.value,
      categoryId: this.editForm.get(['categoryId'])!.value,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ICountry>>): void {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  trackById(index: number, item: ICategory): any {
    return item.id;
  }
}
