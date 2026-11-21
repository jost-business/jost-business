import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  form,
  FormField,
  FormRoot,
  maxLength,
  minLength,
  pattern,
  readonly,
  required,
  validate,
  validateHttp,
  type ValidationError,
} from '@angular/forms/signals';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import type { Trip, TripIdAvailability, TripInput } from '@jost/models';
import { API_BASE_URL, AuthStore, TripsStore } from '@jost/shared';

/** What the form edits. Dates are in the format of <input type="datetime-local">, in local time. */
interface TripFormModel {
  id: string;
  destination: string;
  startsAt: string;
  endsAt: string;
}

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Creates a trip, or edits one when `trip` is given. Built with Signal Forms:
 * the model is a plain signal, and the schema below declares every rule,
 * including an availability check of the id against the API while typing.
 */
@Component({
  selector: 'jost-trip-editor',
  imports: [FormField, FormRoot],
  templateUrl: './trip-editor.component.html',
  styleUrl: './trip-editor.component.scss',
})
export class TripEditorComponent {
  private readonly store = inject(TripsStore);
  private readonly auth = inject(AuthStore);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  /** The trip to edit; without one the form creates a new trip. */
  readonly trip = input<Trip>();
  readonly saved = output<Trip>();
  readonly cancelled = output<void>();

  protected readonly isEdit = computed(() => this.trip() !== undefined);

  /**
   * The form's model. A linkedSignal: it is writable for the form, and starts
   * over from the trip whenever another trip comes in.
   */
  protected readonly model = linkedSignal<Trip | undefined, TripFormModel>({
    source: this.trip,
    computation: trip =>
      trip
        ? { id: trip.id, destination: trip.destination, startsAt: toLocalInput(trip.from), endsAt: toLocalInput(trip.to) }
        : { id: '', destination: '', startsAt: '', endsAt: '' },
  });

  protected readonly tripForm = form(
    this.model,
    path => {
      // The id is part of the URL, so it is fixed once the trip exists
      readonly(path.id, () => this.isEdit());
      required(path.id, { message: 'Give the trip an id.' });
      minLength(path.id, 3, { message: 'At least 3 characters.' });
      maxLength(path.id, 64, { message: 'At most 64 characters.' });
      pattern(path.id, ID_PATTERN, { message: 'Lower-case letters and digits, separated by dashes, like 2027-03-lisbon.' });

      // Asks the API whether the id is still free, 300 ms after the last key
      // press. Async validators only run once the rules above pass.
      validateHttp(path.id, {
        when: () => !this.isEdit(),
        request: ({ value }) => `${this.apiBaseUrl}/trips/availability?id=${encodeURIComponent(value())}`,
        debounce: 300,
        onSuccess: (result: TripIdAvailability) =>
          result.available ? undefined : { kind: 'taken', message: 'There already is a trip with this id.' },
        // If the check itself fails the server still refuses duplicates on save
        onError: () => undefined,
      });

      required(path.destination, { message: 'Where does the trip go?' });
      minLength(path.destination, 2, { message: 'At least 2 characters.' });
      maxLength(path.destination, 120, { message: 'At most 120 characters.' });

      required(path.startsAt, { message: 'When does it start?' });
      required(path.endsAt, { message: 'When does it end?' });
      // A rule across two fields: it reads the start, so it re-runs when the start changes
      validate(path.endsAt, ({ value, valueOf }) => {
        const start = valueOf(path.startsAt);
        return start && value() && value() <= start
          ? { kind: 'endBeforeStart', message: 'The trip must end after it starts.' }
          : undefined;
      });
    },
    {
      // Runs on submit once every rule passes, including the pending id check
      submission: { action: () => this.save() },
    },
  );

  /**
   * Signal Forms wants the submission as a Promise, so the Observable becomes
   * one here, at the edge, and nowhere else.
   */
  private save(): Promise<ValidationError.WithOptionalFieldTree | undefined> {
    const { id, destination, startsAt, endsAt } = this.model();
    const input: TripInput = {
      destination: destination.trim(),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
    };
    const request = this.isEdit() ? this.store.updateTrip(id, input) : this.store.createTrip({ id, ...input });
    return firstValueFrom(
      request.pipe(
        map(trip => {
          this.saved.emit(trip);
          return undefined;
        }),
        catchError((error: unknown) => of(this.toFormError(error))),
      ),
    );
  }

  /** Errors from the server become form errors, on the field they belong to. */
  private toFormError(error: unknown): ValidationError.WithOptionalFieldTree {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      return { kind: 'taken', message: 'There already is a trip with this id.', fieldTree: this.tripForm.id };
    }
    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.auth.sessionEnded();
      return { kind: 'session', message: 'Your session has ended. Please log in again.' };
    }
    return { kind: 'server', message: 'The trip could not be saved. Please try again.' };
  }
}

/** A Date as the local "YYYY-MM-DDTHH:mm" that <input type="datetime-local"> shows. */
function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
