import { useState } from 'react';
import { getValue } from './formDefinition/helpers';

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

  const formState: FormState = externalErrors.reduce(putError, {
    values: transformInitialState(props.initialState),
    errors: [],
    valid: !externalErrors.length,
    touched: false,
  });

  const [state, updateState] = useState(formState);

  function addAsyncErrorFn(error: FormError) {
    console.error("No async errors yet");
  }

  const formDefinition: FormDefinition = {
    state: state,
    handleSubmit: (e, options) => {
      let newState = {...state, touched: true};

      const validationErrors = performValidations(newState.values, props.validations, addAsyncErrorFn)
      const filteredExternalErrors = filterStaleExternalErrors(externalErrors, newState.values);

      newState = {...newState, errors: []};
      newState = validationErrors.reduce(putError, newState);
      newState = filteredExternalErrors.reduce(putError, newState);
      newState = {...newState, valid: !newState.errors.length}

      if (newState.valid) {
        options.onSuccess(e);
      }

      updateState(newState);
    },
    handleBlur: (e) => {
      let newState: FormState = putValue(state, e.target.name, e.target.value, {setTouched: true});

      const validationErrors = performValidations(newState.values, props.validations, addAsyncErrorFn)
      const filteredExternalErrors = filterStaleExternalErrors(externalErrors, newState.values);

      newState = {...newState, errors: []};
      newState = validationErrors.reduce(putError, newState);
      newState = filteredExternalErrors.reduce(putError, newState);
      newState = {...newState, valid: !errorsOnTouchedFields(state).length}

      updateState(newState);
    },
    handleChange: (e) => {
      let newState: FormState = putValue(state, e.target.name, e.target.value, {setTouched: false});

      const validationErrors = performValidations(newState.values, props.validations, addAsyncErrorFn)
      const filteredExternalErrors = filterStaleExternalErrors(externalErrors, newState.values);

      newState = {...newState, errors: []};
      newState = validationErrors.reduce(putError, newState);
      newState = filteredExternalErrors.reduce(putError, newState);
      newState = {...newState, valid: !newState.errors.length};

      updateState(newState);
    },
  }

  return formDefinition;
}

/**
 *
 */
interface PutValueOptions {
  setTouched: boolean,
}

function putValue(
  state: FormState,
  key: string,
  value: any,
  options: PutValueOptions
): FormState {
  const valueObject = {
    ...(state.values[key] || {}),
    value: value,
    touched: options.setTouched ? true : state.values[key].touched || false,
  };

  const values = { ...state.values, [key]: valueObject };

  return {...state, values: values};
}

function putError(state: FormState, error: FormError): FormState {
  return {
    ...state,
    errors: [
      ...state.errors,
      error
    ]
  };
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

function filterStaleExternalErrors(errors: FormError[], values: FormStateValues): FormError[] {
  return errors.filter((error) => error.value === values[error.name].value);
}

function errorsOnTouchedFields(state: FormState): FormError[] {
  if (state.touched) return state.errors;

  const touchedFields: string[] = Object.entries(state.values)
    .reduce((acc: string[], [key, valueObject]) => {
      if (!valueObject.touched) return acc;

      return [...acc, key];
    }, []);

  return state.errors.filter((error: FormError) => touchedFields.includes(error.name));
}

function isPromise<T>(p: any): p is Promise<T>;
function isPromise(p: any): p is Promise<any>;
function isPromise<T>(p: any): p is Promise<T> {
  return p !== null && typeof p === 'object' && typeof p.then === 'function';
}

interface HandleSubmitOptions {
  onSuccess: (e: any) => void,
}

export interface FormDefinition {
  handleChange: (e: any) => void,
  handleBlur: (e: any) => void,
  handleSubmit: (e:any, options: HandleSubmitOptions) => void,
  state: {[key: string]: any},
}

interface FormState {
  values: FormStateValues,
  errors: FormError[],
  valid: boolean,
  touched: boolean,
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

export interface FormError {
  name: string,
  value: string,
  error: string,
  message: string,
}

interface ComponentProps {
  handleSubmit: (e: any) => void
}
