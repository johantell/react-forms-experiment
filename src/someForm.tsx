import React from 'react';
import { useForm, FormDefinition } from './formDefinition';
import { getState, getErrors, isValid, isTouched } from './formDefinition/helpers';
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
        Validations.minLength(3),
        Validations.isExact("Johan"),
      ],
      lastName: [
        Validations.notEqualToField("firstName"),
      ],
      email: [
        Validations.isPresent,
        Validations.isEmail,
      ]
    },
  });

  function handleSubmit(e: React.FormEvent<EventTarget>) {
    e.preventDefault();

    console.log("Submitting");
  }

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <FormInput form={form} name="firstName" type="text" />
      <FormInput form={form} name="lastName" type="text" />
      <FormInput form={form} name="email" type="text" />

      <button type="submit" disabled={!isValid(form)}>submit</button>
    </Form>
  )
}

interface FormProps {
  form: FormDefinition,
  onSubmit: (e: React.FormEvent<EventTarget>) => void,
}

const Form: React.FC<FormProps> = function Form(props) {
  function handleSubmit(e: React.FormEvent<EventTarget>) {
    e.preventDefault();

    props.form.handleSubmit(e, {
      onSuccess: props.onSubmit,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      { props.children }
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
      { isTouched(form, props.name) && inputErrors && inputErrors.map((error) => (
        <span key={error.error} className="error">{error.message}</span>
      ))}
    </div>
  )

}
