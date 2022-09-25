import React, {useState} from 'react';
import Head from 'next/head';

const ContactPage = () => {
  const [errorMsg, setErrorMsg] = useState('');
  async function onSubmit(e) {
    e.preventDefault();
    const body = {
      name: e.currentTarget.name.value,
      email: e.currentTarget.email.value,
      subject: e.currentTarget.subject.value,
      message: e.currentTarget.message.value,
    };
    console.log('contact form', body);
  }
  return (
    <>
      <Head>
        <title>Contact Us | ESportsRef</title>
      </Head>
      <div className="px-8 mx-8">
        <h2 className="flex justify-center text-5xl yellow-title pt-8 mt-8">CONTACT US</h2>
        <div className="grid lg:grid-cols-2 px-8 mt-12">
          <div className="mb-8 px-8">
            <h1 className="yellow-title text-2xl mb-8">LOVE GAMES? HAPPY WATCHING OTHERS PLAY? WANT TO EARN SOME CRYPTO?</h1>
            <p className="mb-4">
            If you answered yes to all three of these questions then we want to hear from you!
            </p>
            <p className="mb-4">
            You’ll need a HPB crypto wallet to receive your payment, and you’ll need a copy of Metamask either on your PC or your mobile phone to interact with the smart contracts we use to manage the games being played. If you’re new to the world of HPB, crypto and blockchain, head over to the HPB section of our website for more information. We’ll show you how to get setup, how to use your crypto wallet, and how to convert your HPB coin into cash!
            </p>
            <p className="mb-8">
            If you want to join the fast-growing community of e-sports referees, then simply fill out the form below and we’ll be in touch.
            </p>
          </div>
          <div className="flex justify-center"><img src="/images/referee-image-600x400.jpg" className="h-96" alt=""/></div>
        </div>
        <div className="flex justify-center">
          <form onSubmit={onSubmit} className="w-5/6 gap-4">
            {errorMsg ? <p style={{ color: 'red' }}>{errorMsg}</p> : null}
            <div className="grid md:grid-cols-2">
              <div className="m-4">
                <label htmlFor="name">Your Name (required): </label>
                <input
                  id="name"
                  className="outline-none py-2 pl-4 block w-full border-b-2 border-yellow-900 bg-transparent"
                  name="name"
                  type="name"
                />
              </div>
              <div className="m-4">
                <label htmlFor="email">Your Email (required): </label>
                <input
                  id="email"
                  className="outline-none py-2 pl-4 block w-full border-b-2 border-yellow-900 bg-transparent"
                  name="email"
                  type="email"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="m-4">
                <label htmlFor="subject">Subject: </label>
                <input
                  id="subject"
                  className="outline-none py-2 pl-4 block w-full border-b-2 border-yellow-900 bg-transparent"
                  name="subject"
                  type="subject"
                />
              </div>
              <div className="m-4">
                <label htmlFor="message">Your Message (required): </label>
                <textarea
                  id="message"
                  className="outline-none py-2 pl-4 block w-full border-b-2 border-yellow-900 bg-transparent"
                  name="message"
                  type="message"
                />
              </div>
            </div>
            <div className="m-4">
              <button type="submit" className="border-2 border-yellow-900 bg-transparent text-white py-2 px-8">SEND</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
