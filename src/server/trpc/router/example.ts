import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),
  getItems: publicProcedure.query(({ctx}) => {
    return ctx.prisma.userItem.findMany();
  }),
  getLists: publicProcedure.query(({ctx}) => {
    return ctx.prisma.userList.findMany();
  })

});
