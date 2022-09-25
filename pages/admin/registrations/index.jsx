import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/index';
import { all } from '@/middlewares/index';
import { getUsers } from '@/db/index';
import AdminSidebar from '@/components/AdminSidebar';
import Table from '@/components/Table';

export default function AdminRegistrationPage({ gameId, game, currentUser, users }) {
  const [user] = useCurrentUser();
  const columns = [
    {
      Header: 'Name',
      accessor: 'name', // accessor is the "key" in the data
    },
    {
      Header: 'Email',
      accessor: 'email',
    },
    {
      Header: 'Role',
      accessor: 'user_type',
    },
    {
      Header: 'Telephone',
      accessor: 'telephone',
    },
    {
      Header: 'HPB Wallet',
      accessor: 'hpbwallet',
    },
    {
      Header: 'Available',
      accessor: 'available',
    },
  ];

  const RegistrationSection = () => {
    const [user, { mutate }] = useCurrentUser();
  
    return (
      <>
        <Head>
          <title>Admin | Registrations</title>
        </Head>
        <section className="container py-8 col-span-5 h-screen overflow-y-scroll">
          <h2 className="flex justify-center text-3xl py-5">Admin - Registrations</h2>
          <div className="flex justify-end gap-4 pr-4 mr-5">
            <Link href="/admin/registrations/add">
              <button className="border-2 border-yellow-900 bg-transparent text-white py-2 px-4">Add</button>
            </Link>
            <button className="border-2 border-yellow-900 bg-transparent text-white py-2 px-4">Delete</button>
          </div>
          <div className="pl-4">
            <Table columns={columns} data={users}/>
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
        <RegistrationSection />
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
