import type { UseFormRegister, FieldErrors } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TextInputProps = {
  label: string
  register: UseFormRegister<any>
  name: string
  errors: FieldErrors<any>
  type?: string
  placeholder?: string
}

export default function TextInput({ label, register, name, errors, type = "text", placeholder }: TextInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        {...register(name, { required: true })}
        id={name}
        name={name}
        type={type}
        autoComplete="name"
        placeholder={placeholder || "m@example.com"}
        required
      />
      {errors[name] && <span className="text-red-600 text-sm">{label} é obrigatório.</span>}
    </div>
  )
}
