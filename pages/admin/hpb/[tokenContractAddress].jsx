import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/index';
import { all } from '@/middlewares/index';
import { findChatHistoryByRoom, findGameByTokenContractAddress, findUserById } from '@/db/index';
import { Chat } from '@/components/Chat';

export default function ChattingViewPage({ tokenContractAddress, p1Name, p2Name, chatHistory, socket }) {
  const [user] = useCurrentUser();
  const chatHistoryObj = JSON.parse(chatHistory);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(chatHistoryObj || []);

  useEffect(() => {
    
  }, [])

  const sendMessage = (event) => {
    event.preventDefault();
  }

  return (
    <>
      <Head>
        <title>Chatting View | ESportsRef</title>
      </Head>
      {!user ? (
        <h2 className="flex justify-center pt-8 text-2xl">You are not allowed to access this page.</h2>
      ) : (
        <div className="flex flex-col justify-center gap-5 p-8 lg:flex-row">
          <div>
            <h2 className="mt-10 text-xl">Smart Contract</h2>
            <h2 className="mt-1 text-xl">{tokenContractAddress}</h2>
            <h2 className="mt-3 text-2xl">Creator: {p1Name}</h2>
            <h2 className="mt-1 text-2xl">Player2: {p2Name}</h2>
          </div>
          <div>
            <Chat
              name={p2Name}
              message={message}
              setMessage={setMessage}
              messages={messages}
              sendMessage={sendMessage}
            />
          </div>
        </div>
      )}
    </>
  )
}

export async function getServerSideProps(context) {
  await all.run(context.req, context.res);
  const tokenContractAddress = context.params.tokenContractAddress;

  const chatHistory = await findChatHistoryByRoom(context.req.db, tokenContractAddress?.trim().toLowerCase());
  const game = await findGameByTokenContractAddress(context.req.db, tokenContractAddress);
  const p1 = await findUserById(context.req.db, game.creatorId);
  const p2 = await findUserById(context.req.db, game.player2);

  return { props: { tokenContractAddress, p1Name: p1.name, p2Name: p2.name, chatHistory: JSON.stringify(chatHistory) } };
}
