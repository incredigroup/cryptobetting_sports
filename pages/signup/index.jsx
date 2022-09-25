import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { useCurrentUser } from '@/hooks/index';
import Dropzone from 'react-dropzone';
import PhoneInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags'
import 'react-phone-number-input/style.css';
import { USER_TYPE } from '@/consts/index';
import { toast } from 'react-toastify';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const SignupPage = () => {
  const [user, { mutate }] = useCurrentUser();
  const emailRef = useRef();
  const addressRef = useRef();
  const birthdayRef = useRef();
  const hpbwalletRef = useRef();
  const nameRef = useRef();
  const fullnameRef = useRef();
  const passwordRef = useRef();
  const userTypeRef = useRef();
  const [phoneNumber, setPhoneNumber] = useState();
  const [file, setFile] = useState();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // redirect to home if user is authenticated
    if (user) Router.replace('/');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    if (new Date(birthdayRef.current.value).getFullYear() > new Date().getFullYear()-19) {
      toast.error('You must be over 18.');
      return;
    }
    if (!phoneNumber) {
      toast.error('Please input your phone number.');
      return;
    }
    if (phoneNumber?.length < 6) {
      toast.error('Please input your phone number correctly.');
      return;
    }
    if (!file) {
      toast.error('Please upload your passport or driver licence image.');
      return;
    }
  
    setLoading(true);

    const formData = new FormData();
    formData.append('email', emailRef.current.value);
    formData.append('name', nameRef.current.value);
    formData.append('fullname', fullnameRef.current.value);
    formData.append('telephone', phoneNumber);
    formData.append('address', addressRef.current.value);
    formData.append('birthday', birthdayRef.current.value);
    formData.append('hpbwallet', hpbwalletRef.current.value);
    formData.append('password', passwordRef.current.value);
    formData.append('user_type', userTypeRef.current.value);
    formData.append('file', file);
    
    const res = await fetch('/api/users', {
      method: 'POST',
      body: formData,
    });
    if (res.status === 201) {
      setLoading(false);
      setSuccess(true);
      await delay(6000);

      const userObj = await res.json();
      mutate(userObj);

      setSuccess(false);
    } else {
      toast.error(await res.text());
      setLoading(false);
    }
  };

  const handleUserTypeChange = ({target: { value: userType }}) => {
    let status = false, name = "";

    if (userType === USER_TYPE.REFEREE) {
      status = true;
      name = 'System will make your id.';
    }

    nameRef.current.disabled = status;
    nameRef.current.value = name;
  }

  return (
    <>
      <Head>
        <title>Sign up | ESportsRef</title>
      </Head>
      <div className="pl-4 mb-8">
        <h2 className="flex justify-center py-5 text-2xl yellow-title">Sign Up</h2>
        <div className="flex justify-center">
          <div className="w-1/2">
            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-3 my-4">
                <h2 className="flex items-center justify-end px-4">Register as</h2>
                <select name="usertype" id="usertype" className="block w-full col-span-2 py-2 pr-4 bg-transparent border-b-2 border-yellow-900 outline-none" ref={userTypeRef} onChange={handleUserTypeChange}>
                  <option className="bg-gray-900" value={USER_TYPE.PLAYER} selected>Player</option>
                  <option className="bg-gray-900" value={USER_TYPE.REFEREE}>Referee</option>
                </select>
              </div>
              <div className="grid grid-cols-3 my-4">
                <h2 className="flex items-center justify-end px-4">Full Name</h2>
                <input
                  id="fullname"
                  className="block w-full col-span-2 py-2 pr-4 bg-transparent border-b-2 border-yellow-900 outline-none"
                  name="fullname"
                  type="text"
                  placeholder="Your full name"
                  minLength={3}
                  maxLength={64}
                  ref={fullnameRef}
                  required
                />
              </div>
              <div className="grid grid-cols-3 my-4">
                <h2 className="flex items-center justify-end px-4">User Name</h2>
                <input
                  id="name"
                  className="block w-full col-span-2 py-2 pr-4 bg-transparent border-b-2 border-yellow-900 outline-none"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  minLength={3}
                  maxLength={32}
                  ref={nameRef}
                  required
                />
              </div>
              <div className="grid grid-cols-3 my-4">
                <h2 className="flex items-center justify-end px-4">Email</h2>
                <input
                  id="email"
                  name="email"
                  className="block w-full col-span-2 py-2 pr-4 bg-transparent border-b-2 border-yellow-900 outline-none"
                  type="email"
                  placeholder="Email address"
                  minLength={4}
                  maxLength={32}
                  ref={emailRef}
                  required
                />
              </div>
              <div className="grid grid-cols-3 my-4">
                <h2 className="flex items-center justify-end px-4">Password</h2>
                <input
                  id="password"
                  name="password"
                  className="block w-full col-span-2 py-2 pr-4 bg-transparent border-b-2 border-yellow-900 outline-none"
                  type="password"
                  placeholder="Create a password"
                  minLength={3}
                  maxLength={32}
                  ref={passwordRef}
                  required
                />
              </div>
              <div className="grid grid-cols-3 my-4">
                <h2 className="flex items-center justify-end px-4">Address</h2>
                <div className="flex items-center col-span-2">
                  <input
                    id="address"
                    name="address"
                    className="w-full py-2 pr-4 bg-transparent border-b-2 border-yellow-900 outline-none"
                    type="text"
                    placeholder="Input your address"
                    minLength={10}
                    maxLength={64}
                    ref={addressRef}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 my-4">
                <h2 className="flex items-center justify-end px-4">Birthday</h2>
                <input
                  id="birthday"
                  name="birthday"
                  className="block w-full col-span-2 py-2 bg-transparent border-b-2 border-yellow-900 outline-none"
                  type="date"
                  maxLength={10}
                  min="1900-01-01"
                  max="2050-12-31"
                  placeholder="Input your birthday"
                  ref={birthdayRef}
                  required
                />
              </div>
              <div className="grid grid-cols-3 my-4">
                <h2 className="flex items-center justify-end px-4">Telephone</h2>
                <PhoneInput flags={flags} minLength={6} maxLength={15} placeholder="Input your phone number" value={phoneNumber} onChange={setPhoneNumber} className="block w-full col-span-2 text-lg text-black bg-transparent border-b-2 border-yellow-900 outline-none" />
              </div>
              <div className="grid grid-cols-3 my-4">
                <h2 className="flex items-center justify-end px-4">HPB wallet</h2>
                <input
                  id="hpbwallet"
                  name="hpbwallet"
                  className="block w-full col-span-2 py-2 pr-4 bg-transparent border-b-2 border-yellow-900 outline-none"
                  type="text"
                  placeholder="Input your HPB wallet address"
                  minLength={42}
                  maxLength={42}
                  ref={hpbwalletRef}
                  required
                />
              </div>
              <div className="flex justify-end my-3">
                <a href="/faq" className="mr-2 text-sm text-blue-500 opacity-80"><i className="text-blue-600 text- fa fa-life-ring"></i> Do you not have your HPB Wallet? </a>
              </div>
              <div className="flex justify-end">
                <Dropzone
                  accept={".jpeg, .jpg, .bmp, .png"}
                  multiple={false}
                  onDrop={acceptedFiles => setFile(acceptedFiles[0])}>
                  {({getRootProps, getInputProps}) => (
                    <div {...getRootProps()} className='w-5/6 p-5 my-3 text-center bg-gray-900 border-2 border-yellow-900 border-dashed cursor-pointer rounded-xl hover:bg-gray-800'>
                      <input {...getInputProps()} />
                      <p><i className="text-4xl fa fa-cloud"></i></p>
                      <p className="text-yellow-600">{file && file.name}</p>
                      <p>Upload your passport or drivers licence image</p>
                    </div>
                  )}
                </Dropzone>
              </div>
              <div className="flex justify-end mt-8">
                <button type="submit" className="w-5/6 py-2 pr-4 text-white bg-transparent border-2 border-yellow-900 hover:bg-gray-800">Sign Up</button>
              </div>
            </form>
          </div>
        </div>
        <Loading status={loading} />
        <Success status={success} />
      </div>
    </>
  );
};

function Loading({ status }) {
  if (!status) return <></>;
  
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center"><i className="text-6xl fa fa-spin fa-spinner"></i></div>
      <div className="fixed inset-0 z-40 bg-black opacity-40"></div>
    </>
  )
}

function Success({ status }) {
  if (!status) return <></>;
  
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="">
          <div className="flex justify-center animate-bounce">
            <img src="esportsref-logo-v3.png" width={135} alt="logo" />
          </div>
          <h2 className="mt-5 mb-4 text-3xl font-semibold text-center">Sign up Success !</h2>
          <p className="text-xl text-center">Thanks, your information will be reviewed by a member of our team, and you will be approved shortly.</p>
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black opacity-90"></div>
    </>
  )
}

export default SignupPage;
