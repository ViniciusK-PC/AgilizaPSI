"use client"
import Link from "next/link"
import Textinput from "../FormInputs/TextInput"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LoginInputProps } from "@/types/type";
import SubmitButton from "../FormInputs/SubmiButton";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginInputProps>();

  async function onSubmit(data: LoginInputProps) {
    console.log(data);
    // Handle registration logic here
  };
  return (

    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Textinput
            label="Email"
            register={register}
            name="email"
            type="email"
            errors={errors}
          />

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                Senha
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                {...register("password", { required: true })}
                id="password"
                name="password"
                type="password"

                autoComplete="current-password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />

              {errors["password"] && (<span className="text-red-600 text-sm">Senha Obrigatório.</span>
              )}
            </div>
          </div>

          <div>
            <SubmitButton title="Login" 
            isLoading={isLoading}
              loadingTitle="Você está sendo conectado(a), aguarde..." />
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Não tenho conta?{' '}
          <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Iniciar Registro
          </Link>
        </p>
      </div>
    </div>

  )
}
