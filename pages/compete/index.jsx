import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { useCurrentUser } from '@/hooks/index';
import web3 from '@/lib/web3';
import ESRToken from '@/abis/esrtoken';
import factoryhpb from '@/abis/factory-hpb';
import OnlineBox from '@/components/OnlineBox'

const CompetePage = () => {
  const [user] = useCurrentUser();
  const [msg, setMsg] = useState({ message: '', isError: false });
  const [createdContractAddr, setCreatedContractAddr] = useState();
  const [account, setAccount] = useState();
  const [currentNetwork, setCurrentNetwork] = useState('looking...');
  const [hpbBalance, setHpbBalance] = useState('getting...');
  const [esrBalance, setEsrBalance] = useState('getting...');

  useEffect(() => {
    if (user) {
      getCurrentChainId();
      getBalance();
    }
  }, [user]);

  useEffect(() => {
    window.ethereum.on("accountsChanged", (accounts) => {
      accounts[0] && getBalance()
    });
  })

  async function isMetaMaskConnected() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    return accounts && accounts.length > 0
  }

  async function getCurrentChainId() {
    try {
      const chainId = await ethereum.request({
        method: 'eth_chainId',
      })
      setCurrentNetwork(chainId == 0x10d ? "HPB Network" : chainId);
    } catch (err) {
      setCurrentNetwork("Can't found Metamask")
      console.error(err);
    }
  }

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

  async function createNewContractHPB() {
    setMsg({ message: 'Waiting on new contract...' });
    
    const accounts = await web3.eth.getAccounts();
    let createdTokenContractObj = await factoryhpb.methods.spawnNewGameContract().send({
      from: accounts[0]
    });

    const createdTokenContractAddr = createdTokenContractObj.events.newContractAddress.returnValues[0];

    let body = { tokenType: 'hpb', tokenContractAddress: createdTokenContractAddr };

    const res = await fetch('/api/games', {
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 200) {
      setCreatedContractAddr(`hpb/${createdTokenContractAddr}`);
      setMsg({ message: '' });
    } else {
      setMsg({ message: 'Network error occored. Status: ' + res.status , isError: true });
    }
  }

  const handleNewContractHPB = async () => {
    if (user.accepted == false) {
      setMsg({ message: 'You can not create a new game yet.' });
      return;
    }
    
    if (user.type !== 'referee') {
      const userId = user._id;
      const res = await fetch('/api/game?creatorId=' + userId);
      if (res.status == 200) {
        const resp = await res.json();
        const createdTokenContractAddr = resp?.game?.tokenContractAddress;
        
        if (createdTokenContractAddr) {
          confirmAlert({
            customUI: ({ onClose }) => {
              return (
                <div className='p-10 bg-black rounded-lg'>
                  <div className="space-y-1 text-center">
                    <h2 className="text-xl">You have already created a game contract</h2>
                    <p className="pt-3 text-xl">Are you sure you want to create another one?</p>
                  </div>
                  <div className="flex justify-center gap-6 mt-8">
                    <button className="px-10 py-2 text-white border-2 border-yellow-900 hover:bg-gray-800" onClick={() => {
                      createNewContractHPB();
                      onClose();
                    }}>Create</button>
                    <button className="px-10 py-2 text-white border-2 border-yellow-900 hover:bg-gray-800" onClick={onClose}>Cancel</button>
                  </div>
                </div>
              );
            }
          });
        } else {
          createNewContractHPB();
        }
      }
    }
  }

  const handleNewContractESR = async () => {
    if (user.accepted == false) {
      setMsg({ message: 'You can not create a new game yet.' });
      return;
    }
    
    setMsg({ message: 'Waiting on new contract...' });
    
    const accounts = await web3.eth.getAccounts();
    let createdTokenContractObj = await factoryhpb.methods.spawnNewGameContract().send({
      from: accounts[0]
    });

    const createdTokenContractAddr = createdTokenContractObj.events.newContractAddress.address;

    let body = { tokenType: 'esr', tokenContractAddress: createdTokenContractAddr };

    const res = await fetch('/api/games', {
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 200) {
      setCreatedContractAddr(`esr/${createdTokenContractAddr}`);
      setMsg({ message: '' });
    } else {
      setMsg({ message: 'Network error occored. Status: ' + res.status , isError: true });
    }
  }

  const handleNewContractNFT = async () => {
    if (user.accepted == false) {
      setMsg({ message: 'You can not create a new game yet.' });
      return;
    }
    
    setMsg({ message: 'Waiting on new contract...' });
    
    const accounts = await web3.eth.getAccounts();
    let createdTokenContractObj = await factoryhpb.methods.spawnNewGameContract().send({
      from: accounts[0]
    });

    const createdTokenContractAddr = createdTokenContractObj.events.newContractAddress.address;

    let body = { tokenType: 'nft', tokenContractAddress: createdTokenContractAddr };

    const res = await fetch('/api/games', {
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 200) {
      setCreatedContractAddr(`nft/${createdTokenContractAddr}`);
      setMsg({ message: '' });
    } else {
      setMsg({ message: 'Network error occored. Status: ' + res.status , isError: true });
    }
  }

  return (
    <>
      <Head>
        <title>Compete | ESportsRef</title>
      </Head>
      { !user ? (
        <Link href="/login">
          <a>
            <h2 className="flex justify-center pt-8 text-2xl">Sign in first, please.</h2>
          </a>
        </Link>
      ) : (
        <section className="py-8">
          <h1 className="flex justify-center py-5 text-3xl">Welcome back {user.name}</h1>
          <div className="grid grid-cols-3 gap-4 p-8">
            <div className="flex justify-center">
              <div>
                <h2><span className="font-bold">HPB wallet address: </span></h2>
                <h2>
                  <a href={"https://hpbscan.org/address/" + user.hpbwallet} target="_blank" className={`${account === user.hpbwallet ? 'text-green-500' : 'text-red-600'}`}>
                    {account ? user.hpbwallet : 'not connected yet'}
                  </a>
                </h2>
                <h2 className="mt-3"><span className="font-bold">Metamask is: </span>{isMetaMaskConnected() ? 'connected' : 'disconnected'}</h2>
                <h2 className="mt-3"><span className="font-bold">You are connected to: </span>{currentNetwork}</h2>
                <h2 className="mt-3"><span className="font-bold">Your HPB wallet balance is: </span>{hpbBalance}</h2>
                <h2 className="mt-3"><span className="font-bold">Your ESR token balance is: </span>{esrBalance}</h2>
                <h2 className="mt-3"><span className="font-bold">Number of ESR NFT's in wallet: </span>{'0'}</h2>
              </div>
            </div>
            <div>
              {user.hpbwallet !== account
                ? <p className="text-xl font-bold text-center text-red-600 animate-pulse">You are not currently connected to your registered wallet.<br /><br /> please switch to your registered wallet to continue</p>
                : <div className="flex justify-center">
                    <div className="">
                      {!user.accepted && <p className="mr-3 text-lg font-bold text-center text-red-600">*** Account awaiting approval ***</p>}
                      {user.user_type === 'player' ?
                        <>
                          <button 
                            className="block px-4 py-2 mt-8 bg-blue-600 rounded"
                            onClick={handleNewContractHPB}
                          >
                            Click to generate new HPB game contract
                          </button>
                          <button 
                            className="block px-4 py-2 mt-3 bg-green-600 rounded"
                            onClick={handleNewContractESR}
                          >
                            Click to generate new ESR game contract
                          </button>
                          <button 
                            className="block px-4 py-2 mt-3 bg-yellow-600 rounded"
                            onClick={handleNewContractNFT}
                          >
                            Click to generate new NFT game contract
                          </button>
                        </>
                        : <>
                          <button 
                            className="block px-6 py-2 mt-8 bg-blue-600 rounded"
                            // onClick={handle}
                          >
                            List of Current HPB Game Contracts
                          </button>
                          <button 
                            className="block px-6 py-2 mt-3 bg-green-600 rounded"
                            // onClick={handle}
                          >
                            List of Current ESR Game Contracts
                          </button>
                          <button 
                            className="block px-6 py-2 mt-3 bg-yellow-600 rounded"
                            // onClick={handle}
                          >
                            List of Current NFT Game Contracts
                          </button>
                        </>
                      }
                    </div>
                  </div>
              }
            </div>
            <div className="flex justify-center">
              <OnlineBox avatar={user.avatar} username={user.name} isOnline={user.isOnline} />
            </div>
          </div>
          { user.user_type === "player" &&
              <div className="flex justify-center space-x-2">
                <button 
                  className="px-4 py-2 bg-blue-600 rounded"
                  // onClick={handle}
                >
                  List of Current HPB Game Contracts
                </button>
                <button 
                  className="px-4 py-2 bg-green-600 rounded"
                  // onClick={handle}
                >
                  List of Current ESR Game Contracts
                </button>
                <button 
                  className="px-4 py-2 bg-yellow-600 rounded"
                  // onClick={handle}
                >
                  List of Current NFT Game Contracts
                </button>
              </div>
          }
          {createdContractAddr && 
            <div className="flex justify-center mt-8">
              <div className="bg-green-400 rounded">
                <p className="px-12 py-5 text-xl text-center text-black">
                  <h3 className="my-2 font-bold">Congratulations!</h3>
                  Click the link to visit your new game contract: <Link href={`/${createdContractAddr}`}><a className="text-yellow-700 underline">{createdContractAddr && createdContractAddr.split('/')[1]}</a></Link></p>
              </div>
            </div>
          }
          {msg.message ? <p className="flex justify-center mt-8 text-lg" style={{ color: msg.isError ? 'red' : '#0070f3', textAlign: 'center' }}>{msg.message}</p> : null}
        </section>
      )}
    </>
  );
};

export default CompetePage;
