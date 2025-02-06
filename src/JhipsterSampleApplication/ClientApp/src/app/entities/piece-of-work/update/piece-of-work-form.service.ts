import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IPieceOfWork, NewPieceOfWork } from '../piece-of-work.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPieceOfWork for edit and NewPieceOfWorkFormGroupInput for create.
 */
type PieceOfWorkFormGroupInput = IPieceOfWork | PartialWithRequiredKeyOf<NewPieceOfWork>;

type PieceOfWorkFormDefaults = Pick<NewPieceOfWork, 'id'>;

type PieceOfWorkFormGroupContent = {
  id: FormControl<IPieceOfWork['id'] | NewPieceOfWork['id']>;
  title: FormControl<IPieceOfWork['title']>;
  description: FormControl<IPieceOfWork['description']>;
};

export type PieceOfWorkFormGroup = FormGroup<PieceOfWorkFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PieceOfWorkFormService {
  createPieceOfWorkFormGroup(pieceOfWork: PieceOfWorkFormGroupInput = { id: null }): PieceOfWorkFormGroup {
    const pieceOfWorkRawValue = {
      ...this.getFormDefaults(),
      ...pieceOfWork,
    };
    return new FormGroup<PieceOfWorkFormGroupContent>({
      id: new FormControl(
        { value: pieceOfWorkRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      title: new FormControl(pieceOfWorkRawValue.title),
      description: new FormControl(pieceOfWorkRawValue.description),
    });
  }

  getPieceOfWork(form: PieceOfWorkFormGroup): IPieceOfWork | NewPieceOfWork {
    return form.getRawValue() as IPieceOfWork | NewPieceOfWork;
  }

  resetForm(form: PieceOfWorkFormGroup, pieceOfWork: PieceOfWorkFormGroupInput): void {
    const pieceOfWorkRawValue = { ...this.getFormDefaults(), ...pieceOfWork };
    form.reset(
      {
        ...pieceOfWorkRawValue,
        id: { value: pieceOfWorkRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): PieceOfWorkFormDefaults {
    return {
      id: null,
    };
  }
}
