import { useState } from 'react';

interface UseFormProps {
  initialState?: {[key: string]: any},
  validations?: Validators,
  errors?: FormError[]
}

export interface ValidatorReturnStruct {
  error: string,
  message: string,
}

type Validator = (value: string, allValues: FormStateKeyValues) => Promise<ValidatorReturnStruct | undefined> | ValidatorReturnStruct | undefined

interface Validators {
  [key: string]: Validator[],
}

export function useForm(props: UseFormProps) {
  const externalErrors = props.errors || [];

  const formState: FormState = {
    values: transformInitialState(props.initialState),
    errors: externalErrors,
    valid: !externalErrors.length,
  };

  const [state, updateState] = useState(formState);

  const formDefinition: FormDefinition = {
    state: state,
    handleBlur: (e) => {
      console.log("blur");
    },
    handleChange: (e) => {
      function addAsyncError(error: FormError) {
        updateState({
          ...state,
          errors: [...state.errors, error],
        });
      }

      const values = putState(state.values, e.target.name, e.target.value);
      const errors = [
        ...performValidations(values, props.validations, addAsyncError),
        ...filterStaleExternalErrors(externalErrors, values)
      ]
      const valid = !errors.length;

      const newState: FormState = {
        ...state,
        values: values,
        valid: valid,
      }

      updateState(newState);
    },
  }

  return formDefinition;
}

interface FormDefinition {
  handleChange: (e: any) => void,
  handleBlur: (e: any) => void,
  state: {[key: string]: any},
}

interface FormState {
  values: FormStateValues,
  errors: FormError[],
  valid: boolean,
}

interface FormStateValues {
  [key: string]: FormStateValue,
}
 
export interface FormStateKeyValues {
  [key: string]: string,
}
 

export interface FormStateValue {
  value: string,
  touched?: boolean,
}

interface FormError {
  name: string,
  value: string,
  error: string,
  message: string,
}

interface ComponentProps {
  handleSubmit: (e: any) => void
}


/**
 *
 */
export function getState(form: FormDefinition, key: string) {
  const valueObject = form.state.values[key];

  return valueObject ? valueObject.value : null;
}

function getValue(valueObject: FormStateValue | undefined): string {
  return valueObject ? valueObject.value : "";
}

/**
 *
 */
export function touched(form: FormDefinition, key: string) {
  return !!form.state.values[key].touched;
}

/**
 *
 */
export function getErrors(form: FormDefinition, fieldName: string): FormError[] {
  return form.state.errors.filter(({ name }: FormError) => name === fieldName);
}

/**
 *
 */
function putState(values: FormStateValues, key: string, value: any): FormStateValues {
  const valueObject = values[key] || {};

  return { ...values, [key]: { ...valueObject, value } };
}

/**
 *
 */
function performValidations(
  values: FormStateValues,
  validations: Validators | undefined,
  addAsyncError: (formError: FormError) => void,
): FormError[] {
  if (!validations) return [];

  const allValues: FormStateKeyValues  = Object.entries(values)
    .reduce((acc, [key, valueObject]) => {
      return { ...acc, [key]: getValue(valueObject) };
    }, {});

  return Object.entries(validations)
    .reduce((errors: FormError[], [fieldName, validations]) => {
      const fieldValue = getValue(values[fieldName]);

      return validations.reduce((errorList: FormError[], validator: Validator) => {
        const error = validator(fieldValue, allValues);

        if (!error) return errorList;

        if (isPromise(error)) {
          Promise.resolve(error).then((error) => {
            if (!error) return;

            const formError: FormError = {
              ...error,
              name: fieldName,
              value: fieldValue,
            };

            addAsyncError(formError);
          });

          return errorList;
        } else {
          const formError: FormError = {
            ...error,
            name: fieldName,
            value: fieldValue,
          };

          return [...errorList, formError];
        }
      }, errors);
    }, []);
}

function transformInitialState(initialState: {[key: string]: string} | undefined) {
  if (!initialState) return [];

  return Object.entries(initialState)
    .reduce((acc, [key, value]) => {
      const valueObject = {
        value: value,
        touched: false,
      };

      return {...acc, [key]: valueObject};
    }, {})
}

/**
 *
 */
export function isValid(form: FormDefinition): boolean {
  return form.state.valid;
}

function filterStaleExternalErrors(errors: FormError[], values: FormStateValues): FormError[] {
  return errors.filter((error) => error.value === values[error.name].value);
}

function isPromise<T>(p: any): p is Promise<T>;
function isPromise(p: any): p is Promise<any>;
function isPromise<T>(p: any): p is Promise<T> {
  return p !== null && typeof p === 'object' && typeof p.then === 'function';
}
