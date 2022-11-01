import { type NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { trpc } from "../utils/trpc";



const Home: NextPage = () => {
  // const hello = trpc.example.hello.useQuery({ text: "from tRPC" });
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main className="flex flex-col items-center pt-4">Loading...</main>;
  }

  return (
    <main className="flex flex-col items-center">
      <h1 className="text-3xl pt-4">Shortlists</h1>
      <div className="pt-10">
      {session ? (
        <div>
          <p>Hi {session.user?.name}</p>
          <div className="pt-6">
            <AddList/>
           
          </div>
            <button onClick={() => signOut()}>
              Logout
            </button>
        </div>
      ) : (
        <button onClick={() => signIn("google")}>
        Login with Google
      </button>
      )}
      </div>
      <div>
        <Lists/>
      </div>

      
    </main>
  );
};

const Lists = () => {
  const {
    data: userlists,
    isLoading
  } = trpc.userList.getAllLists.useQuery();

  if (isLoading) return <div>Fetching lists...</div>

  return (
    <div className="flex flex-col gap-4">
      {userlists?.map((list, index) => {
        return (
          <div key={index}>
            <h1>{list.title}</h1>
            
          </div>
        )
      })}

    </div>
  )
}

const AddList = () => {
  const [title, setTitle] = useState("");
  const utils = trpc.useContext();
  const postList = trpc.userList.postList.useMutation({
    onMutate: () => {
       utils.userList.getAllLists.cancel();
       const optimisticUpdate = utils.userList.getAllLists.getData();
       if (optimisticUpdate) {
        utils.userList.getAllLists.setData(optimisticUpdate)
       }
    },
    onSettled: () => {
      utils.userList.getAllLists.invalidate();
    }
  });

  return (
    <form className="flex gap-2" onSubmit={(event) => {
      event.preventDefault();

      postList.mutate({
        title,
        //creatorId: session.user?.name as string
      })
      setTitle("");
    }} >
      <input
        type='text'
        value={title}
        placeholder="Enter a list title..."
        minLength={2}
        maxLength={50}
        onChange={(event) => setTitle(event.target.value)}
        className='px-4 py-4 rounded-md border-2 border-zinc-800 bg-neutral-900 focus:outline-none'
      />
      <button className="p-2 rounded border-2 border-zinc-800 focus:outline-none">
        Add List
      </button>
    </form>
  )
}



export default Home;

const AuthShowcase: React.FC = () => {
  const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery();

  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {sessionData && (
        <p className="text-2xl text-blue-500">
          Logged in as {sessionData?.user?.name}
        </p>
      )}
      {secretMessage && (
        <p className="text-2xl text-blue-500">{secretMessage}</p>
      )}
      <button
        className="rounded-md border border-black bg-violet-50 px-4 py-2 text-xl shadow-lg hover:bg-violet-100"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

const TechnologyCard = ({
  name,
  description,
  documentation,
}: TechnologyCardProps) => {
  return (
    <section className="flex flex-col justify-center rounded border-2 border-gray-500 p-6 shadow-xl duration-500 motion-safe:hover:scale-105">
      <h2 className="text-lg text-gray-700">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <Link
        className="m-auto mt-3 w-fit text-sm text-violet-500 underline decoration-dotted underline-offset-2"
        href={documentation}
        target="_blank"
        rel="noreferrer"
      >
        Documentation
      </Link>
    </section>
  );
};
