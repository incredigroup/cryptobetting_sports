import React from 'react';
import Head from 'next/head';
import nc from 'next-connect';
import Router from 'next/router';
import { database } from '@/middlewares/index';
import { findTokenByIdAndType } from '@/db/index';

const ResetPasswordTokenPage = ({ valid, token }) => {
  async function handleSubmit(event) {
    event.preventDefault();
    const body = {
      password: event.currentTarget.password.value,
      token,
    };

    const res = await fetch('/api/user/password/reset', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status === 200) Router.replace('/');
  }

  return (
    <>
      <Head>
        <title>Forget password | ESportsRef</title>
      </Head>
      <h2 className="flex justify-center py-8 text-2xl">Reset password</h2>
      {valid ? (
        <>
          <p className="flex justify-center text-xl">Enter your new password.</p>
          <div className="flex justify-center">
            <form onSubmit={handleSubmit} className="w-1/3">
              <div className="my-4">
                <input
                  id="password"
                  name="password"
                  className="outline-none py-2 pr-4 block w-full border-b-2 border-yellow-900 bg-transparent"
                  type="password"
                  placeholder="New password"
                />
              </div>
              <div className="my-4">
                <button type="submit" className="w-full border-2 border-yellow-900 bg-transparent text-white py-2 pr-4">Set new password</button>
              </div>
            </form>
          </div>
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

  const tokenDoc = await findTokenByIdAndType(ctx.req.db, ctx.query.token, 'passwordReset');

  return { props: { token, valid: !!tokenDoc } };
}

export default ResetPasswordTokenPage;
