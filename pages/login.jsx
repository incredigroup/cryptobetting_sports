import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCurrentUser } from '@/hooks/index';

const LoginPage = () => {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [user, { mutate }] = useCurrentUser();
  useEffect(() => {
    // redirect to compete if user is authenticated
    if (user) router.push('/compete');
  }, [user]);

  async function onSubmit(e) {
    e.preventDefault();
    const body = {
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
    };
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 200) {
      const userObj = await res.json();
      mutate(userObj);
    } else {
      setErrorMsg('Incorrect username or password. Try again!');
    }
  }

  return (
    <>
      <Head>
        <title>Sign in | ESportsRef</title>
      </Head>
      <h2 className="flex justify-center text-2xl pt-8">Sign in</h2>
      <div className="flex justify-center">
        <form onSubmit={onSubmit} className="w-1/3">
          {errorMsg ? <p style={{ color: 'red' }}>{errorMsg}</p> : null}
          <div className="my-4">
            <label htmlFor="email">Email: </label>
            <input
              id="email"
              className="outline-none py-2 pl-4 block w-full border-b-2 border-yellow-900 bg-transparent"
              name="email"
              type="email"
              placeholder="Email address"
            />
          </div>
          <div className="my-4">
            <label htmlFor="password">Password: </label>
            <input
              id="password"
              className="outline-none py-2 pl-4 block w-full border-b-2 border-yellow-900 bg-transparent"
              name="password"
              type="password"
              placeholder="Password"
            />
          </div>
          <div className="my-4">
            <button type="submit" className="w-full border-2 border-yellow-900 bg-transparent text-white py-2 pr-4">Sign in</button>
          </div>
          <Link href="/forget-password">
            <a>Forget password</a>
          </Link>
          <Link href="/signup">
            <a className="text-pink-400"> Sign up here</a>
          </Link>
        </form>
      </div>
    </>
  );
};

export default LoginPage;
