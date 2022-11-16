import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { contextProps } from "@trpc/react-query/dist/internals/context";
import { z } from "zod";
//import { trpc } from "../../../utils/trpc";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import * as trpc from "@trpc/server"
import { userLoginSchema, userRegisterSchema, requestOTPSchema, verifyOTPSchema } from "../../../schema/user.schema";
import { sendLoginEmail } from "../../../utils/mailer";
import { decode, encode } from "../../../utils/base64";
import { baseUrl } from "../../../constants";
import { serialize } from 'cookie'
//! https://stackoverflow.com/questions/41292559/could-not-find-a-declaration-file-for-module-module-name-path-to-module-nam for ^
import { signJWT } from "../../../utils/jwt";
import { stringify } from "querystring";

export const userRouter = router({
    registerUser: publicProcedure
        .input(
            userRegisterSchema,
        ) 
        .mutation(async({ctx, input}) => {
            const { email, username, password} = input
        
        try {
          
            const user = ctx.prisma.user.create({
                data: {
                    username,
                    email,
                    password,
                }
                //-32603
                //Object { message: "\nInvalid `prisma.user.create()` invocation:\n\n\nUnique constraint failed on the fields: (`email`)", code: -32603
            })
            return user
        } catch (error) {
            console.log("error" + error)
            console.log("error.code" + error.code)
            if(error instanceof PrismaClientKnownRequestError){
                if(error.code === 'P2002') {
                    throw new trpc.TRPCError({
                        code: 'CONFLICT',
                        message: 'User already exists',
                    })
                   
                }
            }
            throw new trpc.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong',
            })
        }
    }),
    requestOTP: publicProcedure
     .input(requestOTPSchema)
     .mutation(async({ctx, input}) => {
        const {email, redirect} = input
        
        const user = await ctx.prisma.user.findUnique({
            where: {
                email,
            },
        })
        if(!user){
            throw new trpc.TRPCError({
                code: 'NOT_FOUND',
                message: "User was not found",
            })
        }

        const token = await ctx.prisma.loginToken.create({
            data: {
                redirect,
                user: {
                    connect: {
                        id: user.id
                    }
                }
            }
        })

        //send email to user
        await sendLoginEmail({
            token: encode(`${token.id}:${user.email}`),
            url: baseUrl,
            email: user.email,
        })

        return true
     }),
     verifyOTP: publicProcedure
        .input(verifyOTPSchema)
        .query(async({ctx, input}) => {
            const decoded = decode(input.hash).split(':')

            const [id, email] = decoded

            const token = await ctx.prisma.loginToken.findFirst({
                where: {
                    id,
                    user: {
                        email,
                    }
                },
                include: {
                    user: true,
                }
            })

            if(!token){
                throw new trpc.TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Invalid token'
                })
            }

            const jwt = signJWT({
                email: token.user.email,
                id: token.user.id,
            })

            ctx.res.setHeader('Set-Cookie', serialize('token', jwt, {path: '/'}))

            return {
                redirect: token.redirect
            }

        })
}) 

