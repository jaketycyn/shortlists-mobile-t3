import {z} from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const userListRouter = router({

    
    getAllLists: protectedProcedure
        .query(async({ctx}) => {
            try {
                return await ctx.prisma.userList.findMany({
                    select: {
                        title: true
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                })
            } catch (error) {
                console.log('error', error)
            }
        })
    , postList: protectedProcedure
        .input(
            z.object({
                title: z.string(),
            })
        )
        .mutation(async ({ctx, input}) => {
            try {
                await ctx.prisma.userList.create({
                    data: {
                        title: input.title,
                        // todo: createdBy ID which references the current user logged in ID
                    }
                })
            } catch (error) {
                console.log('error', error)
            }
        })
})