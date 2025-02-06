import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IPieceOfWork } from 'app/entities/piece-of-work/piece-of-work.model';
import { PieceOfWorkService } from 'app/entities/piece-of-work/service/piece-of-work.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';
import { JobService } from '../service/job.service';
import { IJob } from '../job.model';
import { JobFormGroup, JobFormService } from './job-form.service';

@Component({
  selector: 'jhi-job-update',
  templateUrl: './job-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class JobUpdateComponent implements OnInit {
  isSaving = false;
  job: IJob | null = null;

  pieceOfWorksSharedCollection: IPieceOfWork[] = [];
  employeesSharedCollection: IEmployee[] = [];

  protected jobService = inject(JobService);
  protected jobFormService = inject(JobFormService);
  protected pieceOfWorkService = inject(PieceOfWorkService);
  protected employeeService = inject(EmployeeService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: JobFormGroup = this.jobFormService.createJobFormGroup();

  comparePieceOfWork = (o1: IPieceOfWork | null, o2: IPieceOfWork | null): boolean => this.pieceOfWorkService.comparePieceOfWork(o1, o2);

  compareEmployee = (o1: IEmployee | null, o2: IEmployee | null): boolean => this.employeeService.compareEmployee(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ job }) => {
      this.job = job;
      if (job) {
        this.updateForm(job);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const job = this.jobFormService.getJob(this.editForm);
    if (job.id !== null) {
      this.subscribeToSaveResponse(this.jobService.update(job));
    } else {
      this.subscribeToSaveResponse(this.jobService.create(job));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IJob>>): void {
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

  protected updateForm(job: IJob): void {
    this.job = job;
    this.jobFormService.resetForm(this.editForm, job);

    this.pieceOfWorksSharedCollection = this.pieceOfWorkService.addPieceOfWorkToCollectionIfMissing<IPieceOfWork>(
      this.pieceOfWorksSharedCollection,
      ...(job.chores ?? []),
    );
    this.employeesSharedCollection = this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(
      this.employeesSharedCollection,
      job.employee,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.pieceOfWorkService
      .query()
      .pipe(map((res: HttpResponse<IPieceOfWork[]>) => res.body ?? []))
      .pipe(
        map((pieceOfWorks: IPieceOfWork[]) =>
          this.pieceOfWorkService.addPieceOfWorkToCollectionIfMissing<IPieceOfWork>(pieceOfWorks, ...(this.job?.chores ?? [])),
        ),
      )
      .subscribe((pieceOfWorks: IPieceOfWork[]) => (this.pieceOfWorksSharedCollection = pieceOfWorks));

    this.employeeService
      .query()
      .pipe(map((res: HttpResponse<IEmployee[]>) => res.body ?? []))
      .pipe(
        map((employees: IEmployee[]) => this.employeeService.addEmployeeToCollectionIfMissing<IEmployee>(employees, this.job?.employee)),
      )
      .subscribe((employees: IEmployee[]) => (this.employeesSharedCollection = employees));
  }
}
