import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Error from 'next/error';
import { all } from '@/middlewares/index';
import { useCurrentUser } from '@/hooks/index';
import { extractUser } from '@/lib/api-helpers';
import { findUserById } from '@/db/index';
import { defaultProfilePicture } from '@/lib/default';

export default function UserPage({ user }) {
  if (!user) return <Error statusCode={404} />;
  const {
    name, email, bio, profilePicture, _id
  } = user || {};
  console.log('user', user);
  const [currentUser] = useCurrentUser();
  const isCurrentUser = currentUser?._id === user._id;
  return (
    <>
      <Head>
        <title>{name} | ESportsRef</title>
      </Head>
      <div className="flex container items-center justify-center p-8">
        <img className="w-40 h-auto mr-3 rounded-full	" src={profilePicture || defaultProfilePicture(_id)} width="256" height="256" alt={name} />
        <section className="pl-8">
          <div className="flex">
            <h2 className="text-white">{name}</h2>
            {isCurrentUser && (
            <Link href="/settings">
              <button type="button" className="px-8">Edit</button>
            </Link>
            )}
          </div>
          <div className="text-white py-5">
            Bio
            <p>{bio}</p>
          </div>
          <div className="text-white">
            Email
            <p>
              {email}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  await all.run(context.req, context.res);
  const user = extractUser(await findUserById(context.req.db, context.params.userId));
  if (!user) context.res.statusCode = 404;
  return { props: { user } };
}
