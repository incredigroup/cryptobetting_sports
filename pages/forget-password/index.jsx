import React, { useState } from 'react';
import Head from 'next/head';

const ForgetPasswordPage = () => {
  const [msg, setMsg] = useState({ message: '', isError: false });

  async function handleSubmit(e) {
    e.preventDefault(e);

    const body = {
      email: e.currentTarget.email.value,
    };

    const res = await fetch('/api/user/password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status === 200) {
      setMsg({ message: 'An email has been sent to your mailbox' });
    } else {
      setMsg({ message: await res.text(), isError: true });
    }
  }

  return (
    <>
      <Head>
        <title>Forget password | ESportsRef</title>
      </Head>
      <h2 className="flex justify-center py-8 text-2xl">Forget password</h2>
      {msg.message ? <p style={{ color: msg.isError ? 'red' : '#0070f3', textAlign: 'center' }}>{msg.message}</p> : null}
      <div className="flex justify-center">
        <form onSubmit={handleSubmit} className="w-1/2">
          <p>Do not worry. Simply enter your email address below.</p>
          <div className="my-4">
            <label htmlFor="email">
              Email 
            </label>
            <input
              id="email"
              name="email"
              className="outline-none py-2 pr-4 block w-full border-b-2 border-yellow-900 bg-transparent"
              type="email"
              placeholder="Email address"
            />
          </div>
          <div className="my-4">
            <button type="submit" className="w-full border-2 border-yellow-900 bg-transparent text-white py-2 pr-4">Submit</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ForgetPasswordPage;
