import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useCurrentUser } from '@/hooks/index';
import Navbar from './navbar';
import { useRouter } from 'next/router';
import CONSTANTS from '@/consts/index';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Layout({ children, socket }) {
  const router = useRouter();
  const [user] = useCurrentUser();
  const [invites, setInvites] = useState([]);
  const [msg, setMsg] = useState({ message: '', isError: false });

  useEffect(async () => {  
    if (user) {
      getInvites();

      socket.emit(CONSTANTS.JOIN_GLOBAL, { name: user.name, room: CONSTANTS.GLOBAL_ROOM });
      
      socket.on('invite', userId => {
        if (user._id == userId && user.accepted == true) {
          getInvites();
        }
      })
    }
  }, [user]);

  async function getInvites() {
    const res = await fetch('/api/invites');
    if (res.status === 200) {
      const resp = await res.json();
      setInvites(resp.invites);
    }
  }

  const acceptInvite = async (inviteId, status, invGameId) => {
    // if current user is referee, directly join the game
    if (user.user_type == 'referee') {
      let body = { inviteId, status: 'referee_accepted' };
      let res = await fetch('/api/invites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        // Update games
        body = { gameId: invGameId, status: 'ready_to_play' };
        res = await fetch('/api/games', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.status === 200) {
          const resp = await res.json();
  
          const {tokenType, tokenContractAddress} = resp.game;
          router.push(`/${tokenType}/${tokenContractAddress}`);
  
          const messageBody = {
            tokenContractAddress: tokenContractAddress.trim().toLowerCase(),
            message: `<span class='font-semibold text-blue-800'>${user.name} accepted invitation.</span>`
          }
          socket.emit('admin-message', messageBody);
          socket.emit('sendNotify', tokenContractAddress, () => null);
        }
      }

      return;
    }
    let body = { inviteId, status };
    let res = await fetch('/api/invites', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 200) {
      let resp = await res.json();
      let gameId = resp.invite.gameId;
      
      // Refresh invites
      res = await fetch('/api/invites');
      if (res.status === 200) {
        resp = await res.json();
        setInvites(resp.invites);
      }
      // Update games
      body = { gameId, status };
      res = await fetch('/api/games', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        resp = await res.json();
        console.log('Game updated:', resp);

        const {tokenType, tokenContractAddress} = resp.game;
        router.push(`/${tokenType}/${tokenContractAddress}`);

        const messageBody = {
          tokenContractAddress: tokenContractAddress.trim().toLowerCase(),
          message: `<span class='font-semibold text-blue-800'>${user.name} accepted invitation.</span>`
        }
        socket.emit('admin-message', messageBody);
        socket.emit('sendNotify', tokenContractAddress, () => null);
      }
    } else {
      setMsg({ message: await res.text(), isError: true });
    }
  };

  const rejectInvite = async (inviteId, status, invGameId) => {
    // if current user is referee, directly join the game
    if (user.user_type == 'referee') {
      let body = { inviteId, status: 'accepted', referee: '' };
      let res = await fetch('/api/invites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        // Update games
        body = { gameId: invGameId, status: 'accepted', referee: '' };
        res = await fetch('/api/games', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.status === 200) {
          const resp = await res.json();
          const { tokenContractAddress } = resp.game;
          const messageBody = {
            tokenContractAddress: tokenContractAddress.trim().toLowerCase(),
            message: `<span class='font-semibold text-yellow-800'>${user.name} rejected invitation.</span>`
          }
          socket.emit('admin-message', messageBody);
          socket.emit('sendNotify', tokenContractAddress, () => null);
          getInvites();
        }
      }

      return;
    }

    // player
    let body = { inviteId, status };
    let res = await fetch('/api/invites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 200) {
      let resp = await res.json();
      let gameId = resp.invite.gameId;
      
      // Refresh invites
      res = await fetch('/api/invites');
      if (res.status === 200) {
        resp = await res.json();
        setInvites(resp.invites);
      }
      // Update games
      body = { gameId, status };
      res = await fetch('/api/games', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        resp = await res.json();
        const { tokenContractAddress } = resp.game;

        const messageBody = {
          tokenContractAddress: tokenContractAddress.trim().toLowerCase(),
          message: `<span class='font-semibold text-yellow-800'>${user.name} rejected invitation.</span>`
        }
        socket.emit('admin-message', messageBody);
        socket.emit('sendNotify', tokenContractAddress, () => null);
      }
    } else {
      setMsg({ message: await res.text(), isError: true });
    }
  }

  const isAdminPage = user && user.user_type == 'admin' && router.pathname.startsWith('/admin/');

  return (
    <>
      <style jsx global>
        {`
          .Toastify__toast-container {
            width: auto;
          }
          .Toastify__toast-body {
            padding: 1.2rem 3.5rem !important;
          }
          a {
            text-decoration: none !important;
            cursor: pointer;
          }
          a:hover {
            color: #0366d6;
          }
          body {
            margin: 0;
            padding: 0;
            color: #fff;
            font-family: ABeeZee;
            background-color: #001021;
          }
          ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1; 
          }
          ::-webkit-scrollbar-thumb {
            background: #888; 
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #555; 
          }
          .react-confirm-alert-overlay {
            background-color: rgba(20, 20, 20, 0.8);
          }
        `}
      </style>
      <Head>
        <title>ESports for Crypto | ESportsRef</title>
        <meta
          key="viewport"
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta
          name="description"
          content="nextjs-mongodb-app is a continously developed app built with Next.JS and MongoDB. This project goes further and attempts to integrate top features as seen in real-life apps."
        />
        <meta property="og:title" content="ESports for Crypto" />
        <meta
          property="og:description"
          content="nextjs-mongodb-app is a continously developed app built with Next.JS and MongoDB. This project goes further and attempts to integrate top features as seen in real-life apps."
        />
        <link sizes="16x16" href="/esportsref-favicon.png" rel="icon" />
        <link rel="stylesheet" id="k2t-google-font-ABeeZee-css" href="https://fonts.googleapis.com/css?family=ABeeZee%3A100%2C200%2C300%2C400%2C500%2C600%2C700%2C800%2C900&amp;subset=latin%2Cgreek-ext%2Ccyrillic%2Clatin-ext%2Cgreek%2Ccyrillic-ext%2Cvietnamese" type="text/css" media="all" />
        <link rel="stylesheet" id="font-awesome-css" href="/font-awesome.min.css?ver=5.4.5" type="text/css" media="all" />
        <meta
          property="og:image"
          content="https://repository-images.githubusercontent.com/201392697/5d392300-eef3-11e9-8e20-53310193fbfd"
        />
      </Head>
      { isAdminPage ? null : <Navbar /> }
      {!user ? null : (
        !invites ? null : (
          <div>
            {invites.map(invite => (
              <h2 className="">
                Player <span className="px-2 bg-red-500 rounded">{invite.creatorName}</span> has invited you to their game 
                <button onClick={() => acceptInvite(invite._id, 'accepted', invite.gameId)} className="px-5 m-1 bg-green-400">Accept</button>
                <button onClick={() => rejectInvite(invite._id, 'created', invite.gameId)} className="px-5 bg-red-500">Reject</button>
              </h2>
            ))}
          </div>
        )
      )}
      <main>{children}</main>
      <ToastContainer position="bottom-left" closeButton={false} className="text-lg" />
    </>
  );
};