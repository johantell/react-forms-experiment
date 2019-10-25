
export interface ValidationError {
  name: string,
  value: string,
  error: string,
  message: string,
}

interface DataValidatorStruct {
  validations: Validators,
}

export function init(validations?: Validators): DataValidatorStruct {
  return {
    validations: validations || {},
  };
}

export function validate(
  validator: DataValidatorStruct,
  data: ValidatableData
): ValidationError[] {
  return Object.entries(validator.validations)
    .reduce((errorAccumulator: ValidationError[], [validatableFieldName, validations]) => {
      const fieldValue = data[validatableFieldName];

      return validations.reduce((errors: ValidationError[], validator: Validator) => {
        const result = validator(fieldValue, validatableFieldName, data);

        if (!result) return errors;

        return [...errors, result];
      }, errorAccumulator);
    }, []);
}

type Validator = (
  value: string,
  fieldName: string,
  allValues: ValidatableData
) => ValidationError | undefined


interface ValidatableData {
  [key: string]: string,
}

export interface ValidatorReturnStruct {
  error: string,
  message: string,
}

export interface Validators {
  [key: string]: Validator[],
}
