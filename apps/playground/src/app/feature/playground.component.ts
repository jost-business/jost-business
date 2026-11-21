import { Component, computed, signal } from '@angular/core';
import { FormField, email, form, minLength, required, submit } from '@angular/forms/signals';

interface Signup {
  name: string;
  email: string;
}

const EMPTY_SIGNUP: Signup = { name: '', email: '' };

/** Demo of Signal Forms: the model is a plain signal, the form is derived from it. */
@Component({
  selector: 'app-playground',
  imports: [FormField],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss',
})
export class PlaygroundComponent {
  // The single source of truth: typing updates this signal, and setting it updates the inputs
  protected readonly model = signal<Signup>({ ...EMPTY_SIGNUP });

  protected readonly signupForm = form(this.model, path => {
    required(path.name, { message: 'Please enter your name' });
    minLength(path.name, 2, { message: 'At least 2 characters' });
    required(path.email, { message: 'Please enter your email' });
    email(path.email, { message: 'That does not look like an email address' });
  });

  // Derived values stay in sync without any change detection wiring
  protected readonly nameLength = computed(() => this.model().name.length);
  protected readonly greeting = computed(() => this.model().name.trim().toUpperCase());

  protected readonly submitted = signal<Signup | null>(null);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    // submit() marks all fields as touched and only runs the action when the form is valid
    // The action must return a Promise; nothing here is asynchronous, so it is an already resolved one
    submit(this.signupForm, () => {
      this.submitted.set(this.model());
      return Promise.resolve(undefined);
    });
  }

  protected reset(): void {
    this.model.set({ ...EMPTY_SIGNUP });
    this.submitted.set(null);
  }
}
