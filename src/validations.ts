import { FormStateKeyValues, ValidatorReturnStruct } from './formDefinition';

export function minLength(length: number) {
  return function validateMinLength(value: string) {
    if (value.length < length) {
      return {
        error: "minLength",
        message: `must have a length greater or equal to ${length}.`,
      }
    }
  }
}

export function isExact(matchValue: string) {
  return function validateIsExact(value: string) {
    if (value !== matchValue) {
      return {
        error: "isExact",
        message: `must be ${matchValue}.`,
      }
    }
  }
}

export function notEqualToField(fieldName: string) {
  return function validatenotEqualToField(value: string, allValues: FormStateKeyValues) {
    if (value !== allValues[fieldName]) {
      return {
        error: "notEqualToField",
        message: `must be equal the value of \`${fieldName}\`.`,
      }
    }
  }
}

export function isPresent(value: string) {
  if (!value || value.length === 0) {
    return {
      error: "isPresent",
      message: `must be present.`,
    }
  }
}

export function isEmail(value: string) {
  if (!(value || "").match(/.+@.+/gi)) {
    return {
      error: "isEmail",
      message: "must be a valid email."
    }
  }
}

export function isAvailable(value: string) {
  return new Promise<ValidatorReturnStruct | undefined>((resolve) => {
    setTimeout(() => {
      resolve({
        error: "isAvilable",
        message: "is not available.",
      });
    }, 1000);
  });
}
