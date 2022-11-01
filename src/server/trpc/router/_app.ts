import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { userListRouter } from "./userlist";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  userList: userListRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
