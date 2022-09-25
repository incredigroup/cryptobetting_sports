import React, { useEffect } from 'react';
import Head from 'next/head';
import nc from 'next-connect';
import Router from 'next/router';
import { database } from '@/middlewares/index';
import { findTokenByIdAndType } from '@/db/index';

const SignupTokenPage = ({ valid, token }) => {
  useEffect(async () => {
    if ( valid ) {
      const body = {
        token,
      };
  
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      if (res.status === 200) Router.replace('/login');
    }
  }, []);
  
  return (
    <>
      <Head>
        <title>Sign Up | ESportsRef</title>
      </Head>
      <h2 className="flex justify-center py-8 text-2xl">Verify your email to sign up</h2>
      {valid ? (
        <>
          <p className="flex justify-center py-8 text-2xl">Your email has been verified successfully</p>
        </>
      ) : (
        <p className="flex justify-center py-8 text-2xl">This link may have been expired</p>
      )}
    </>
  );
};

export async function getServerSideProps(ctx) {
  const handler = nc();
  handler.use(database);
  await handler.run(ctx.req, ctx.res);
  const { token } = ctx.query;

  const tokenDoc = await findTokenByIdAndType(ctx.req.db, ctx.query.token, 'signup');

  return { props: { token, valid: !!tokenDoc } };
}

export default SignupTokenPage;
