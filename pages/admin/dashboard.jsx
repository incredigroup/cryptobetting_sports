import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useCurrentUser } from '@/hooks/index';
import AdminSidebar from '@/components/AdminSidebar';

const DashboardSection = () => {
  const [user, { mutate }] = useCurrentUser();

  return (
    <>
      <Head>
        <title>Admin | Dashboard</title>
      </Head>
      <section className="container py-8 col-span-5">
        <h2 className="flex justify-center text-3xl py-5">Admin - Dashboard Area</h2>
      </section>
    </>
  );
};

const AdminDashboardPage = () => {
  const [user] = useCurrentUser();

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
        <DashboardSection />
      </div>
    </>
  );
};

export default AdminDashboardPage;
