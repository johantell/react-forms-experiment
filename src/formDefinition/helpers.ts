import { FormDefinition, FormStateValue } from '../formDefinition';
import { ValidationError } from './validator';

/**
 *
 */
export function getState(form: FormDefinition, key: string) {
  const valueObject = form.state.values[key];

  return valueObject ? valueObject.value : null;
}

/**
 *
 */
export function getValue(valueObject: FormStateValue | undefined): string {
  return valueObject ? valueObject.value : "";
}

/**
 *
 */
export function isTouched(form: FormDefinition, key: string) {
  return !!form.state.touched || !!form.state.values[key].touched;
}

/**
 *
 */
export function getErrors(form: FormDefinition, fieldName: string): ValidationError[] {
  return form.state.errors.filter((error: ValidationError) => error.name === fieldName)
}

/**
 *
 */
export function isValid(form: FormDefinition): boolean {
  return form.state.valid;
}
