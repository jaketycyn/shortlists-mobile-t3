import { request } from 'http'
import z from 'zod'

export const createUserSchema = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
})

export type CreateUserInput = z.TypeOf<typeof createUserSchema>

export const requestOTPSchema = z.object({
    email: z.string().email(),
    redirect: z.string().default('/')
})

export type requestOTPInput = z.TypeOf<typeof requestOTPSchema>