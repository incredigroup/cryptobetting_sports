import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import nc from 'next-connect';
import { useRouter } from 'next/router';
import { database } from '@/middlewares/index';
import { useCurrentUser } from '@/hooks/user';
import { extractUser } from '@/lib/api-helpers';
import { findUserById } from '@/db/index';
import { USER_TYPE } from '@/consts/index';

const CheckUserPage = ({ confirmUser }) => {
  const [msg, setMsg] = useState({ message: '', isError: false });
  
  const router = useRouter();
  const [user] = useCurrentUser();
  
  useEffect(() => {
    if (user) {
      switch (user.user_type) {
        case USER_TYPE.PLAYER:
          router.push('/login'); break;
      }
    }
  }, [user])

  const handleAccept = async () => {
    const body = {
      userId: confirmUser._id,
      accepted: true
    }

    const res = await fetch('/api/checkuser', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status == 200) {
      setMsg({ message: 'This user is just approved.' });
      router.push(router.asPath);
    } else {
      setMsg({ message: await res.text(), isError: true });
    }
  }

  const handleReject = async () => {
    const body = {
      userId: confirmUser._id,
      accepted: false
    }

    const res = await fetch('/api/checkuser', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status == 200) {
      setMsg({ message: 'This user is just rejected.' });
      router.push(router.asPath);
    } else {
      setMsg({ message: await res.text(), isError: true });
    }
  }

  return (
    <>
      <Head>
        <title>Confirm user | ESportsRef</title>
      </Head>
      <h2 className="flex justify-center py-8 text-2xl">Confirm user age via licence card</h2>
      <div className="w-2/3 mx-auto">
        <div className="flex justify-center gap-8">
          <img src={confirmUser.card_image} alt="licence card" />
          <div className="text-lg">
            <h3>Name: {confirmUser.name}</h3>
            <h3 className="pt-2">Email: {confirmUser.email}</h3>
            <h3 className="pt-2">Address: {confirmUser.address}</h3>
            <h3 className="pt-2">Birthday: {confirmUser.birthday}</h3>
            <h3 className="pt-2">Telephone: {confirmUser.telephone}</h3>
          </div>
        </div>
        <h3 className="mt-5 text-center text-yellow-600">This user is {confirmUser.accepted ? 'already approved.' : 'waiting your apporovement now.'}</h3>
        <div className="flex justify-center my-12">
          <button className="w-40 py-2 mr-8 text-white bg-transparent border-2 border-yellow-900 hover:bg-gray-800" onClick={handleAccept}>Accept</button>
          <button className="w-40 py-2 ml-8 text-white bg-transparent border-2 border-yellow-900 hover:bg-gray-800" onClick={handleReject}>Reject</button>
        </div>
      </div>
      {msg.message ? <p className="flex justify-center mt-4 text-lg" style={{ color: msg.isError ? 'red' : '#0070f3', textAlign: 'center' }}>{msg.message}</p> : null}
    </>
  );
};

export async function getServerSideProps(context) {
  const handler = nc();
  handler.use(database);
  await handler.run(context.req, context.res);

  const { userId: confirmUserId } = context.params;
  const confirmUser = await findUserById(context.req.db, confirmUserId);

  if (!confirmUser) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  return { props: { confirmUser } };
}

export default CheckUserPage;
