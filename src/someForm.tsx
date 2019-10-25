import React from 'react';
import { useForm, getState, getErrors, isValid } from './formDefinition';
import * as Validations from './validations';

const fetchedData = {
  firstName: "Oa",
  lastName: "Trickery",
  email: null,
}

export const SomeForm: React.FC = function SomeForm() {
  const form = useForm({
    initialState: fetchedData,
    validations: {
      firstName: [
        // Validations.minLength(3),
        // Validations.isExact("Johan"),
        Validations.isAvailable,
      ],
      lastName: [
        // Validations.notEqualToField("firstName"),
      ],
      email: [
        // Validations.isPresent,
        // Validations.isEmail,
      ]
    },
    errors: [
      {
        name: "lastName",
        value: "Trickery",
        error: "Whatevererror",
        message: "I can create my own errors"
      }
    ],
  });

  function handleSubmit(e: React.FormEvent<EventTarget>) {
    e.preventDefault();

    console.log(e.target);
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormInput form={form} name="firstName" type="text" />
      <FormInput form={form} name="lastName" type="text" />
      <FormInput form={form} name="email" type="text" />

      <button type="submit" disabled={!isValid(form)}>submit</button>
    </form>
  )
}

interface FormInputProps {
  form: any,
  name: string,
  type?: string,
}

function FormInput(props: FormInputProps) {
  const form = props.form;
  const inputErrors = getErrors(form, props.name);

  return (
    <div>
      <label>
        {props.name}
        <input
          autoComplete="off"
          type={props.type}
          name={props.name}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          defaultValue={getState(form, props.name)}
        />
      </label>
      { inputErrors && inputErrors.map((error) => (
        <span key={error.error} className="error">{error.message}</span>
      ))}
    </div>
  )

}
