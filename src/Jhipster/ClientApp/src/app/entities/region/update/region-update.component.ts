import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IRegion } from '../region.model';
import { RegionService } from '../service/region.service';
import { RegionFormService, RegionFormGroup } from './region-form.service';

@Component({
  standalone: true,
  selector: 'jhi-region-update',
  templateUrl: './region-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class RegionUpdateComponent implements OnInit {
  isSaving = false;
  region: IRegion | null = null;

  editForm: RegionFormGroup = this.regionFormService.createRegionFormGroup();

  constructor(
    protected regionService: RegionService,
    protected regionFormService: RegionFormService,
    protected activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ region }) => {
      this.region = region;
      if (region) {
        this.updateForm(region);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const region = this.regionFormService.getRegion(this.editForm);
    if (region.id !== null) {
      this.subscribeToSaveResponse(this.regionService.update(region));
    } else {
      this.subscribeToSaveResponse(this.regionService.create(region));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IRegion>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(region: IRegion): void {
    this.region = region;
    this.regionFormService.resetForm(this.editForm, region);
  }
}
