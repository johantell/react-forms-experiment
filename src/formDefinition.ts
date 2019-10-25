import { useState } from 'react';
import { getValue } from './formDefinition/helpers';
import * as Validator from './formDefinition/validator';

interface UseFormProps {
  initialState?: {[key: string]: any},
  validations?: Validator.Validators,
  errors?: Validator.ValidationError[]
}

export function useForm(props: UseFormProps) {
  const externalErrors = props.errors || [];

  const validator = Validator.init(props.validations);

  const formState: FormState = externalErrors.reduce(putError, {
    values: transformInitialState(props.initialState),
    errors: [],
    valid: !externalErrors.length,
    touched: false,
  });

  const [state, updateState] = useState(formState);

  const formDefinition: FormDefinition = {
    state: state,
    handleSubmit: (e, options) => {
      let newState = {...state, touched: true};

      const validationErrors = Validator.validate(validator, getValues(newState));
      const validatedState = applyValidationErrors(newState, validationErrors);

      if (validatedState.valid) {
        options.onSuccess(e);
      }

      updateState(validatedState);
    },
    handleBlur: (e) => {
      let newState: FormState = putValue(state, e.target.name, e.target.value, {setTouched: true});

      const validationErrors = Validator.validate(validator, getValues(newState));
      const validatedState = applyValidationErrors(newState, validationErrors);

      updateState(validatedState);
    },
    handleChange: (e) => {
      let newState: FormState = putValue(state, e.target.name, e.target.value, {setTouched: false});

      const validationErrors = Validator.validate(validator, getValues(newState));
      const validatedState = applyValidationErrors(newState, validationErrors);

      updateState(validatedState);
    },
  }

  return formDefinition;
}

function getValues(state: FormState): FormStateKeyValues {
  return Object.entries(state.values)
  .reduce((acc, [key, valueObject]) => {
    return { ...acc, [key]: getValue(valueObject) };
  }, {});
}

function applyValidationErrors(
  state: FormState,
  validationErrors: Validator.ValidationError[],
): FormState {
  let newState: FormState = {...state, errors: validationErrors};
  newState = {...newState, valid: !errorsOnTouchedFields(newState).length};

  return newState;
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

function putError(state: FormState, error: Validator.ValidationError): FormState {
  return {
    ...state,
    errors: [
      ...state.errors,
      error
    ]
  };
}

type AddAsyncErrorCallback = (formError: Validator.ValidationError) => void;

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

function errorsOnTouchedFields(state: FormState): Validator.ValidationError[] {
  if (state.touched) return state.errors;

  const touchedFields: string[] = Object.entries(state.values)
    .reduce((acc: string[], [key, valueObject]) => {
      if (!valueObject.touched) return acc;

      return [...acc, key];
    }, []);

  return state.errors.filter((error: Validator.ValidationError) => touchedFields.includes(error.name));
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
  errors: Validator.ValidationError[],
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

interface ComponentProps {
  handleSubmit: (e: any) => void
}
