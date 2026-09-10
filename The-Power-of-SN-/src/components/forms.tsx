'use client';
import { useActionState, startTransition } from 'react';
import { useFormStatus } from 'react-dom';
import type { FormState } from '@/lib/types';
export type Action = (state: FormState, data: FormData) => Promise<FormState>;
export function SmartForm({
  action,
  children,
  submit = 'Simpan',
  className = '',
  confirm,
}: {
  action: Action;
  children: React.ReactNode;
  submit?: string;
  className?: string;
  confirm?: string;
}) {
  const [state, dispatch, pending] = useActionState(action, {});
  // Dispatch manually: keep typed input on validation/network failure (React action forms reset uncontrolled fields).
  return (
    <form
      className={'form ' + className}
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        if (confirm && !window.confirm(confirm)) return;
        const data = new FormData(e.currentTarget);
        startTransition(() => dispatch(data));
      }}
    >
      {state.error && (
        <div role="alert" className="notice error">
          {state.error}
        </div>
      )}
      {state.success && (
        <div role="status" className="notice success">
          {state.success}
        </div>
      )}
      <fieldset
        disabled={pending}
        style={{ border: 0, padding: 0, margin: 0, display: 'contents' }}
      >
        {children}
        <div>
          <button type="submit" disabled={pending}>
            {pending ? 'Memproses…' : submit}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Memproses…' : children}</button>;
}
export function Field({
  label,
  name,
  type = 'text',
  value = '',
  required = false,
  help,
  maxLength,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  value?: string;
  required?: boolean;
  help?: string;
  maxLength?: number;
  minLength?: number;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
      />
      {help && <span className="help">{help}</span>}
    </label>
  );
}
