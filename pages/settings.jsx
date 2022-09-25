import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import web3 from '@/lib/web3';
import ESRToken from '@/abis/esrtoken';
import { all } from '@/middlewares/index';
import { useCurrentUser } from '@/hooks/index';
import { findUserById } from '@/db/index';
import { EditText } from 'react-edit-text';
import { toast } from 'react-toastify';
import 'react-edit-text/dist/index.css';

const fieldWidth = {
  width: 200
};

export default function ProfilePage({ currentUser }) {
  const [user, { mutate }] = useCurrentUser();
  const [showModal, setShowModal] = useState(false);
  const [online, setOnline] = useState(true);
  const [msg, setMsg] = useState({ message: '', isError: false });
  const [account, setAccount] = useState();
  const [hpbBalance, setHpbBalance] = useState('...');
  const [esrBalance, setEsrBalance] = useState('...');
  const [password, setPassword] = useState('**********');
  const [createdContractAddr, setCreatedContractAddr] = useState();

  const avatars = [
    "avatar_01.png",
    "avatar_02.png",
    "avatar_03.png",
    "avatar_04.png",
    "avatar_05.png",
    "avatar_06.png",
    "avatar_07.png",
    "avatar_08.png",
    "avatar_09.png",
    "avatar_10.png",
    "avatar_01.png",
    "avatar_02.png",
    "avatar_03.png",
    "avatar_04.png",
    "avatar_05.png",
    "avatar_01.png",
    "avatar_02.png",
    "avatar_03.png",
    "avatar_04.png",
    "avatar_05.png",
    "avatar_06.png",
    "avatar_07.png",
    "avatar_08.png",
    "avatar_09.png",
    "avatar_10.png",
    "avatar_01.png",
    "avatar_02.png",
    "avatar_03.png",
    "avatar_04.png",
    "avatar_05.png",
    "avatar_06.png",
    "avatar_07.png",
    "avatar_08.png",
    "avatar_09.png",
    "avatar_10.png",
  ];

  useEffect( async () => {
    if (user) {
      setOnline(user.isOnline);
      getBalance();
      
      if (user.type !== 'referee') {
        // search game by creatorId
        const userId = user._id;
        const res = await fetch('/api/game?creatorId=' + userId);
        if (res.status == 200) {
          const resp = await res.json();
          const createdTokenContractAddr = resp?.game?.tokenContractAddress;
          if (createdTokenContractAddr) {
            setCreatedContractAddr(`hpb/${createdTokenContractAddr}`);
          }
        }
      } 
    }
  }, [user]);

  async function getBalance() {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) return;
    setAccount(accounts[0]);

    const balance = await web3.eth.getBalance(accounts[0]);
    setHpbBalance(Number.parseFloat(web3.utils.fromWei(balance, 'ether')).toFixed(4));

    const walletAddr = accounts[0];
    const tokenContractAddr = "0xa7be5e053cb523585a63f8f78b7dbca68647442f";
    const tokenContract = new web3.eth.Contract(ESRToken.abi, tokenContractAddr);
    const esrBalance = await tokenContract.methods.balanceOf(walletAddr).call();
    setEsrBalance(Number.parseFloat(web3.utils.fromWei(esrBalance, 'ether')).toFixed(4))
  }

  const handleAvatarClick = async (avatar) => {
    setShowModal(false);

    const body = {
      avatar: avatar
    }

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.status === 200) {
      const userData = await res.json();
      mutate(userData);
      toast.info('Profile updated');
    } else {
      toast.error(await res.text());
    }
  }

  const handleOnlineToggle = async () => {
    const body = {
      isOnline: !online
    }
    setOnline(!online);
    
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.status === 200) {
      const userData = await res.json();
      mutate(userData);

      toast.error('Online status changed');
    } else {
      toast.error(await res.text());
    }
  }

  const handleSave = async ({ name, value }) => {
    const body = {
      [name]: value
    }
    
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.status === 200) {
      const userData = await res.json();
      mutate(userData);

      setPassword('*********');

      toast.info(name + ' has just saved successfully.');
    } else {
      toast.error(await res.text());
    }
  }

  return (
    <>
      <style jsx global>
        {`
          #toggle:checked ~ .dot {
            transform: translateX(100%);
            background-color: #48bb78;
          }
        `}
      </style>
      <Head>
        <title>Profile | ESportsRef</title>
      </Head>
      {!user ? (
        <Link href="/login">
          <a>
            <h2 className="flex justify-center pt-8 text-2xl">Sign in first, please.</h2>
          </a>
        </Link>
      ) : (
      <section className="container py-3 m-auto mb-5">
        <h1 className="flex justify-center py-5 text-3xl">Profile</h1>
        <div className="flex">
          <div className="flex pl-8">
            <div>
              <button onClick={() => setShowModal(true)}>
                <Image className="rounded" src={`/images/avatars/${user.avatar}`} width={121} height={121} />
                <p className="mt-1 text-sm text-center">Click to change</p>
              </button>
            </div>
            <div className="ml-5">
              <EditText name="name" defaultValue={currentUser.name} className="mt-1 text-2xl bg-transparent rounded" style={fieldWidth} onSave={handleSave} />
              <h2 className="mt-3"><strong>Registered as: </strong>{user.user_type}</h2>
              <div className="flex mt-3">
                <div
                  className="w-5 h-5 mr-3 rounded-full"
                  style={{ backgroundColor: user.isOnline ? '#34D399':'#888' }}
                ></div>
                <p style={{ color: user.isOnline ? '#34D399':'#888' }}>
                  {user.isOnline ? "Online" : "Offline"}
                </p>
              </div>
              <label htmlFor="toggle" className="flex items-center mt-3 cursor-pointer">
                <p className="mr-3">Appear as online</p>
                <div className="relative">
                  <input type="checkbox" id="toggle" className="sr-only" checked={online} onChange={handleOnlineToggle} />
                  <div className="block w-12 bg-gray-600 rounded-full h-7"></div>
                  <div className="absolute w-5 h-5 transition bg-gray-200 rounded-full dot left-1 top-1"></div>
                </div>
              </label>
            </div>
          </div>
          <div className="ml-28">
            <h2>
              {!user.accepted && <p className="mb-4 text-lg font-bold text-red-600">*** Account awaiting approval ***</p>}
              <strong>HPB Wallet Address: </strong>
              <a href={"https://hpbscan.org/address/" + user.hpbwallet} target="_blank" className={`${account === user.hpbwallet ? 'text-green-500' : 'text-red-600'}`}>
                {user.hpbwallet}
              </a>
            </h2>
            <p className="text-sm text-gray-400">Please send email to <a href="mailto:support@esportsref.com">"support@esportsref.com"</a> if you wish to change your wallet address. Maximum one change per month.</p>
            <div className="flex mt-7">
              <div className="w-1/2">
                <h2><strong>HPB Coin Balance: </strong>{hpbBalance}</h2>
                <h2 className="mt-1"><strong>ESR Token Balance: </strong>{esrBalance}</h2>
                <h2 className="mt-1"><strong>ESR NFT Trophies: </strong>0</h2>
              </div>
              <div className="flex flex-col items-end w-1/2">
                <div className="flex items-center mt-1">
                  <label className="font-bold">Email: </label>
                  <EditText name="email" defaultValue={currentUser.email} className="bg-transparent rounded" style={fieldWidth} placeholder="click to edit" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-1">
                  <label className="font-bold">Password: </label>
                  <EditText name="password" value={password} className="bg-transparent rounded" style={fieldWidth} placeholder="click to edit" onChange={setPassword} onSave={handleSave} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-16">
          <div className="w-1/2">
            <h2>Add your usernames and gamer ID's so people can easily search for you</h2>
            <div className="flex mt-5">
              <div>
                <div className="flex items-center">
                  <label className="font-bold">Twitch: </label>
                  <EditText name="twitch" defaultValue={currentUser.othernames.twitch} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-2">
                  <label className="font-bold">Facebook: </label>
                  <EditText name="facebook" defaultValue={currentUser.othernames.facebook} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-2">
                  <label className="font-bold">Youtube: </label>
                  <EditText name="youtube" defaultValue={currentUser.othernames.youtube} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-2">
                  <label className="font-bold">Xbox: </label>
                  <EditText name="xbox" defaultValue={currentUser.othernames.xbox} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-2">
                  <label className="font-bold">PSN: </label>
                  <EditText name="psn" defaultValue={currentUser.othernames.psn} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-2">
                  <label className="font-bold">Nintendo: </label>
                  <EditText name="nintendo" defaultValue={currentUser.othernames.nintendo} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-2">
                  <label className="font-bold">Steam: </label>
                  <EditText name="steam" defaultValue={currentUser.othernames.steam} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
              </div>
              <div className="ml-10">
                <div className="flex items-center">
                  <label className="font-bold">Epic: </label>
                  <EditText name="epic" defaultValue={currentUser.othernames.epic} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-2">
                  <label className="font-bold">Google: </label>
                  <EditText name="google" defaultValue={currentUser.othernames.google} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-2">
                  <label className="font-bold">Twitter: </label>
                  <EditText name="twitter" defaultValue={currentUser.othernames.twitter} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-2">
                  <label className="font-bold">Instagram: </label>
                  <EditText name="instagram" defaultValue={currentUser.othernames.instagram} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-2">
                  <label className="font-bold">Telegram: </label>
                  <EditText name="telegram" defaultValue={currentUser.othernames.telegram} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-2">
                  <label className="font-bold">WeChat: </label>
                  <EditText name="wechat" defaultValue={currentUser.othernames.wechat} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
                <div className="flex items-center mt-2">
                  <label className="font-bold ">Reddit: </label>
                  <EditText name="reddit" defaultValue={currentUser.othernames.reddit} className="text-blue-400 bg-transparent rounded" style={fieldWidth} placeholder="click to add" onSave={handleSave} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between w-1/2 p-10 border">
            <div>
              <h3 className="text-4xl">Game statistics:</h3>
              <h3 className="text-5xl font-bold mt-14">COMING SOON!</h3>
            </div>
            <img className="rounded" src="./images/award.png" />
          </div>
        </div>
        {showModal && 
          <>
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden outline-none overscroll-y-auto focus:outline-none">
              <div className="relative w-auto max-w-3xl mx-auto my-6">
                <div className="relative w-full overflow-y-auto bg-blue-900 border border-white shadow-lg" style={{maxHeight: '50vh'}}>
                  <h2 className="sticky top-0 z-10 py-2 text-4xl font-bold text-center bg-blue-900 border-b border-white opacity-80">Select Your Avatar</h2>
                  <div className="grid grid-cols-5 gap-4 p-6">
                    { avatars && avatars.map((avatar, index) => {
                        return (
                          <Image
                            id={index}
                            className="rounded cursor-pointer"
                            src={`/images/avatars/${avatar}`}
                            width={121}
                            height={121}
                            onClick={() => handleAvatarClick(avatar)}
                          />
                        );
                      })
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="fixed inset-0 z-40 bg-black opacity-50"></div>
          </>
        }
        {createdContractAddr && 
          <div className="flex justify-center mt-9">
            <div className="bg-green-400 rounded">
              <p className="px-12 py-5 text-xl text-center text-black">
                <h3 className="my-2 font-bold">Link to current game:</h3>
                <Link href={`/${createdContractAddr}`}><a className="text-yellow-700 underline">{createdContractAddr && createdContractAddr.split('/')[1]}</a></Link></p>
            </div>
          </div>
        }
        {msg.message ? <p className="flex justify-center mt-4 text-lg" style={{ color: msg.isError ? 'red' : '#0070f3', textAlign: 'center' }}>{msg.message}</p> : null}
      </section>
      )}
    </>
  );
};

export async function getServerSideProps(context) {
  await all.run(context.req, context.res);
  
  const currentUser = await findUserById(context.req.db, context.req.user?._id);
  if (!currentUser) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  return { props: { currentUser } }
}