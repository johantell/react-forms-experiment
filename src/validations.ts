import { FormStateKeyValues } from './formDefinition';

type ValidationValue = string

export function minLength(length: number) {
  return function validateMinLength(value: ValidationValue, fieldName: string) {
    if (value.length < length) {
      return {
        name: fieldName,
        value: value,
        error: "minLength",
        message: `must have a length greater or equal to ${length}.`,
      }
    }
  }
}

export function isExact(matchValue: string) {
  return function validateIsExact(value: ValidationValue, fieldName: string) {
    if (value !== matchValue) {
      return {
        name: fieldName,
        value: value,
        error: "isExact",
        message: `must be ${matchValue}.`,
      }
    }
  }
}

export function notEqualToField(matchingFieldName: string) {
  return function validatenotEqualToField(
    value: ValidationValue,
    fieldName: string,
    allValues: FormStateKeyValues
  ) {
    if (value !== allValues[matchingFieldName]) {
      return {
        name: fieldName,
        value: value,
        error: "notEqualToField",
        message: `must be equal the value of \`${fieldName}\`.`,
      }
    }
  }
}

export function isPresent(value: ValidationValue, fieldName: string) {
  if (!value || value.length === 0) {
    return {
      name: fieldName,
      value: value,
      error: "isPresent",
      message: `must be present.`,
    }
  }
}

export function isEmail(value: ValidationValue, fieldName: string) {
  if (!(value || "").match(/.+@.+/gi)) {
    return {
      name: fieldName,
      value: value,
      error: "isEmail",
      message: "must be a valid email."
    }
  }
}
