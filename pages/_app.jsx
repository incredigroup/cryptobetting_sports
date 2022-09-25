import Layout from '@/components/layout';
import { UseWalletProvider } from 'use-wallet';
import io from 'socket.io-client';
import '../styles/globals.css';

const socket = io('/');

export default function MyDApp({ Component, pageProps }) {
  const HPB = 0x10d; // 269

  return (
    <UseWalletProvider chainId={HPB}>
      <Layout socket={socket}>
        <Component {...pageProps} socket={socket} />
      </Layout>
    </UseWalletProvider>
  );
}