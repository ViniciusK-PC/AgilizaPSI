"use client"
import { useForm } from "react-hook-form";
import { type RegisterInputProps } from "@/types/type";
import Link from "next/link"
import TextInput from "../FormInputs/TextInput";
import SubmitButton from "../FormInputs/SubmiButton";
import { useState } from "react";
import { createUser } from "@/actions/users";
//import { UserRole } from "@/generated/prisma/enums";
import toast from "react-hot-toast";
import { UserRole } from "@prisma/client";




export default function RegisterForm({ role = "USER" }: { role?: UserRole }) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterInputProps>();

  async function onSubmit(data: RegisterInputProps) {
    // console.log(data);
    setIsLoading(true);
    data.role = role;
    try {
      const user = await createUser(data)
      if (user && user.status === 200) {
        console.log( "Usuário criado com sucesso");
        reset();
        setIsLoading(false);
        toast.success("Usuário criado com sucesso");
        console.log(user.data);
      } else {
        setIsLoading(false);
        toast.error(user.error || "Algo deu errado");
        console.log(user.error);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast.error("Algo deu errado2");
    }
  }
  return (

    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Criar nova conta
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TextInput
            label="Nome Completo"
            register={register}
            name="fullName"
            errors={errors}
          />
          <TextInput
            label="Email"
            register={register}
            name="email"
            type="email"
            errors={errors}
          />
          <TextInput
            label="Numero De Telefone"
            register={register}
            name="phone"
            type="tel"
            errors={errors}
          />

          <TextInput
            label="Senha"
            register={register}
            name="password"
            type="password"
            errors={errors}
          />


          <div>
            <SubmitButton title="Criar uma conta" isLoading={isLoading}
              loadingTitle="Criando por favor aguarde..." />
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          já tenho uma conta?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Conecte-se
          </Link>
        </p>
      </div>
    </div>

  )
}

