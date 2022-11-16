import { request } from 'http'
import z, { string } from 'zod'

export const userLoginSchema = z.object({
    email: string().email(),
    password: z.string().min(5).max(15),
})

export const userRegisterSchema = userLoginSchema.extend({
    username: z.string(),
})


export const requestOTPSchema = z.object({
    email: z.string().email(),
    redirect: z.string().default('/')
})



export const verifyOTPSchema = z.object({
    hash: z.string(),
})

export type userLogin = z.TypeOf<typeof userLoginSchema>
export type userRegister = z.TypeOf<typeof userRegisterSchema>

export type requestOTPInput = z.TypeOf<typeof requestOTPSchema>
export type verifyOTPInput = z.TypeOf<typeof verifyOTPSchema>