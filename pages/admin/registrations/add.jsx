import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCurrentUser } from '@/hooks/index';
import { all } from '@/middlewares/index';
import { getUsers } from '@/db/index';
import AdminSidebar from '@/components/AdminSidebar';
import Table from '@/components/Table';

export default function AdminAddUserPage({ gameId, game, currentUser, users }) {
  const router = useRouter();
  const [user] = useCurrentUser();
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      email: e.currentTarget.email.value,
      name: e.currentTarget.name.value,
      telephone: e.currentTarget.telephone.value,
      hpbwallet: e.currentTarget.hpbwallet.value,
      password: e.currentTarget.password.value,
      user_type: e.currentTarget.usertype.value,
    };
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 201) {
      const userObj = await res.json();
      router.push('/admin/registrations');
    } else {
      setErrorMsg(await res.text());
    }
  };

  const AddUserSection = () => {
    const [user, { mutate }] = useCurrentUser();
  
    return (
      <>
        <Head>
          <title>Admin | Add User</title>
        </Head>
        <section className="container py-8 col-span-5">
          <h2 className="flex justify-center text-3xl py-5">Add User</h2>
          <div className="pl-4">
            <div className="flex justify-center">
              <div className="w-1/2">
                <form onSubmit={handleSubmit} className="p-4">
                  {errorMsg ? <p style={{ color: 'red' }}>{errorMsg}</p> : null}
                  <div className="my-4 grid grid-cols-3">
                    <h2 className="flex justify-end items-center px-4">Name</h2>
                    <input
                      id="name"
                      className="col-span-2 outline-none py-2 px-3 block w-full border-b-2 border-yellow-900 bg-transparent"
                      name="name"
                      type="text"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="my-4 grid grid-cols-3">
                    <h2 className="flex justify-end items-center px-4">Email</h2>
                    <input
                      id="email"
                      name="email"
                      className="col-span-2 outline-none py-2 px-3 block w-full border-b-2 border-yellow-900 bg-transparent"
                      type="email"
                      placeholder="Email address"
                    />
                  </div>
                  <div className="my-4 grid grid-cols-3">
                    <h2 className="flex justify-end items-center px-4">Password</h2>
                    <input
                      id="password"
                      name="password"
                      className="col-span-2 outline-none py-2 px-3 block w-full border-b-2 border-yellow-900 bg-transparent"
                      type="password"
                      placeholder="Create a password"
                    />
                  </div>
                  <div className="my-4 grid grid-cols-3">
                    <h2 className="flex justify-end items-center px-4">Telephone</h2>
                    <input
                      id="telephone"
                      name="telephone"
                      className="col-span-2 outline-none py-2 px-3 block w-full border-b-2 border-yellow-900 bg-transparent"
                      type="text"
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="my-4 grid grid-cols-3">
                    <h2 className="flex justify-end items-center px-4">HPB wallet</h2>
                    <input
                      id="hpbwallet"
                      name="hpbwallet"
                      className="col-span-2 outline-none py-2 px-3 block w-full border-b-2 border-yellow-900 bg-transparent"
                      type="text"
                      placeholder="HPB wallet address"
                    />
                  </div>
                  <div className="my-4 grid grid-cols-3">
                    <h2 className="flex justify-end items-center px-4">Register as</h2>
                    <select name="usertype" id="usertype" className="col-span-2 outline-none py-2 px-3 block w-full border-b-2 border-yellow-900 bg-transparent">
                      <option className="bg-gray-900" value="player" selected>Player</option>
                      <option className="bg-gray-900" value="referee">Referee</option>
                    </select>
                  </div>
                  <div className="mt-12 grid grid-cols-2 gap-4">
                    <button className="w-full border-2 border-yellow-900 bg-transparent text-white py-2 pr-4">Register &amp; Add another</button>
                    <button className="w-full border-2 border-yellow-900 bg-transparent text-white py-2 pr-4">Register only</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  if (!user) {
    return (
      <>
        <h2 className="flex justify-center text-2xl pt-8">You are not allowed to access this page.</h2>
      </>
    );
  }
  return (
    <>
      <div className='grid grid-cols-6'>
        <AdminSidebar />
        <AddUserSection />
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  await all.run(context.req, context.res);
  let users = await getUsers(context.req.db);
  if (context.req.user) {
    users = users.filter(user => user._id !== context.req.user._id);
  }

  return { props: { users } };
}
