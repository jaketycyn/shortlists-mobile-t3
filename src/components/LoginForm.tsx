import Link from "next/link"
import { useRouter } from "next/router";
import {useForm} from 'react-hook-form'
import type { CreateUserInput } from "../server/trpc/router/user";
import { trpc } from "../utils/trpc";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react"
import { useState } from "react";

function VerifyToken({hash}:{hash: string}) {
  const router = useRouter();

  const {data, isLoading} = trpc.users.verifyOTP.useQuery({hash})

  if (isLoading){
    return <p>Verifying...</p>
  }

  router.push(data?.redirect.includes('login') ? '/' : data?.redirect || '/')
  return <p>Redirect...</p>
}




function LoginForm(){
  const [success, setSuccess] = useState();

   const {handleSubmit, register} = useForm<CreateUserInput>({
    defaultValues: {
        'email': '',
        
    }
   });
   const router = useRouter();

   const {mutate, error} = trpc.users.requestOTP.useMutation({
 
    onSuccess(data, variables, context) {
        setSuccess(true)
    },
   })

   //Google Handler Function
   async function handleGoogleSignin() {
    signIn('google', {callbackUrl:"http://localhost:3000"});
   }

   function onSubmit(values: CreateUserInput){
    mutate({...values, redirect: router.asPath})
   }


   const hash = router.asPath.split('#token=')[1]

   if(hash) {
    return <VerifyToken hash={hash} />
   }


    return <>

    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-20 ">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              className="font-medium text-indigo-600 hover:text-indigo-500"
              href={"/register"}
              //onClick={toggleMember}
            >
             
             register a new account
               
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" name="remember" defaultValue="true" />

          <div className="-space-y-px rounded-md shadow-sm">
            <div className="mt-2 text-center">
              {/* {showAlert && (
                <div className="group relative flex w-full justify-center rounded-lg border border-transparent text-white bg-indigo-600 py-2 px-4 ">
                  <Alert />
                </div>
              )} */}
              <p>{error && error.message}</p>
            </div>
          </div>

          <div>
            <div>
              <input
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="E-mail"
                type="email"
               {...register('email')}
                required
              />
            </div>

            <div>
              <input
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Password"
                type="password"
                
                {...register('password')}
                // value={values.password}
                // onChange={handleChange}
              />
            </div>
            <div className="flex items-center justify-between  mt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>
            <div>
              <button
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2.5 px-4 mt-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                type="submit"
              >
               Login
              </button>
            </div>
            <div className="flex flex-col text-center py-6">
                <button  className="group relative flex w-3/5 mx-auto justify-center rounded-md border-2 border-black py-2.5 px-4  text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 "
                type="submit"
                onClick={handleGoogleSignin}
                >Sign In with Google
                  <div className="px-2 flex">
                  <Image src={'/assets/google-48.png'} width="20" height={20} className="" alt="google icon"></Image>
                  </div>
                  </button>
            </div>
          </div>
        </form>
      </div>
    </div>
</>
}

export default LoginForm