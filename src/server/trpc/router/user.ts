import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { contextProps } from "@trpc/react-query/dist/internals/context";
import { z } from "zod";
//import { trpc } from "../../../utils/trpc";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import * as trpc from "@trpc/server"
import { createUserSchema, requestOTPSchema } from "../../../schema/user.schema";
import { sendLoginEmail } from "../../../utils/mailer";
import { getBaseUrl } from "../../../utils/trpc";
import { encode } from "../../../utils/base64";
import { baseUrl } from "../../../constants";

export const userRouter = router({
    registerUser: publicProcedure
        .input(
            createUserSchema,
        ) 
        //? Leaving output here as a reference for future output uses:  YT vid explaining output uses: https://youtu.be/syEWlxVFUrY?t=2371
        // .output(
        //     z
        //         .object({
        //             name: z.string(),
        //             email: z.string().email()
        //         })
        // )
        .mutation(async({ctx, input}) => {
        try {
            const { email, username, password} = input
            console.log(input)

            const user = ctx.prisma.user.create({
                data: {
                    username,
                    email,
                    password,
                }
            })
            return user
        } catch (error) {
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

            //console.log('error', error)
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
     })
}) 

