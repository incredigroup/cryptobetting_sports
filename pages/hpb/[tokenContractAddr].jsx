import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { Chat } from '@/components/Chat';
import { ParticipantContainer } from '@/components/ParticipantContainer'
import { all } from '@/middlewares/index';
import { useCurrentUser } from '@/hooks/user';
import { extractUser } from '@/lib/api-helpers';
import { getPlayers, findUserById, findGameByTokenContractAddress, findChatHistoryByRoom, getOnlineReferees } from '@/db/index';
import Countdown, { zeroPad } from "react-countdown";
import { toast } from 'react-toastify';
import { TheCopyboard, TheCopyboardStyle } from 'the-copyboard'
import Select from 'react-select';
//////////////////
import web3 from '@/lib/web3'
import Child from '@/abis/child-hpb'

// Game status constants
const GAME_CREATED = 'created';
const GAME_INVITING = 'inviting';
const GAME_ACCEPTED = 'accepted';
const GAME_PLAYER1_READY = 'player1-ready';
const GAME_PLAYER2_READY = 'player2-ready';
const GAME_ON_CONTRACT = 'on_contract';
const GAME_ABANDONED = 'abandoned';
const GAME_SET_CONTRACT = 'set_contract';
const GAME_FIRST_DEPOSITED = 'first_deposited';
const GAME_WAIT_REFEREE = 'wait_for_referee';
const GAME_PLAY_READY = 'ready_to_play';
const GAME_P1_READY = 'p1_ready';
const GAME_P2_READY = 'p2_ready';
const GAME_PLAYING_NOW = 'playing_now';
const GAME_ONE_CONCEDE = 'one_concede';
const GAME_REF_JUDGED = 'referee_judged';
const GAME_UNDER_DISPUTE = 'under_dispute';
const GAME_ADMINS_CHECKING = 'admins_checking';
const GAME_DISPUTE_RESOLVED = 'dispute_resolved';
const GAME_PAYOUT_WINNER = 'payout_winner';
const GAME_FINISHED = 'finished';

const REMAINING_TIME_TO_DISPUTE = 10 * 60 * 1000; // 10 minutes, after hpb wil be award to winner
const REMAINING_TIME_TO_ACCEPT = 3 * 60 * 1000; // 3 minutes, after the game will be abandoned
const REMAINING_TIME_TO_DEPOSIT = 5 * 60 * 1000; // 5 minutes
const REMAINING_TIME_TO_RESELECT_REFEREE = 2 * 60 * 1000; // 2 minutes

export default function ContractPage({ gameId, game, tokenContractAddr, chatHistory, players, currentUser, socket, onlineReferees }) {
  const gameObj = JSON.parse(game);
  const chatHistoryObj = JSON.parse(chatHistory);
  const router = useRouter();
  const [user] = useCurrentUser();
  const [participants, setParticipants] = useState([]);
  const [msg, setMsg] = useState({ message: '', isError: false });
  const [gameData, setGameData] = useState(gameObj);
  const [gameStatus, setGameStatus] = useState(gameObj.status);
  const [startPoint, setStartPoint] = useState(gameObj.startPoint);
  const [refRandomNumber, setRefRandomNumber] = useState(0);
  const [inviteId, setInviteId] = useState();

  const emailTextRef = useRef();

  // react-select
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerList, setPlayerList] = useState();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(chatHistoryObj || []);

  useEffect(async () => {
    if (user) {
      const p2 = await fetch('/api/participants?id=' + `${ currentUser._id == gameData.creatorId ? gameData?.player2 : gameData?.creatorId }`);
      const ref = gameData.inviteId ? await fetch('/api/invite?id=' + gameData.inviteId + '&gameId=' + gameId) : null;
      const p2_res = await p2.json();
      const ref_res = gameData.inviteId ? await ref.json() : null;

      setParticipants([
        { name: user.name, avatar: user.avatar, isOnline: user.isOnline },
        { name: p2_res?.user?.name, avatar: p2_res?.user?.avatar, isOnline: p2_res?.user?.isOnline },
        { name: ref_res?.user?.name, avatar: ref_res?.user?.avatar, isOnline: ref_res?.user?.isOnline }
      ]);

      let list = players.map(player => {
        return { value: player.name, label: player.name, _id: player._id }
      });
      list = list.filter(player => (player.value !== user.name))

      setPlayerList(list)
      setRefRandomNumber(gameObj.refRandomNumber || 0);
    }
  }, [user])

  useEffect(() => {
    socket.emit('join', { name: currentUser.name, room: tokenContractAddr }, (error) => error && alert(error))
    socket.emit('sendNotify', tokenContractAddr, () => null);

    socket.on('notify', async () => {
      // update game status per request
      const res = await fetch('/api/games?id=' + gameId);
      if (res.status === 200) {
        const resp = await res.json();
        setGameStatus(resp.game.status);
        setStartPoint(resp.game.startPoint);
        setRefRandomNumber(resp.game.refRandomNumber || "not selected yet.");
        setInviteId(resp.game.inviteId);

        const p2 = await fetch('/api/participants?id=' + `${ currentUser._id == resp.game.creatorId ? resp.game.player2 : resp.game.creatorId }`);
        const ref = resp.game.inviteId ? await fetch('/api/invite?id=' + resp.game.inviteId + '&gameId=' + gameId) : null;
        const p2_res = await p2.json();
        const ref_res = resp.game.inviteId ? await ref.json() : null;
  
        setParticipants(prev => [
          { ...prev[0] },
          { name: p2_res?.user?.name, avatar: p2_res?.user?.avatar, isOnline: p2_res?.user?.isOnline },
          { name: ref_res?.user?.name, avatar: ref_res?.user?.avatar, isOnline: ref_res?.user?.isOnline }
        ]);
      }
    });
  
    socket.on('game_accepted', () => {
      gameObj.status = 'accepted';
      setGameStatus(GAME_ACCEPTED);
    })
  
    socket.on('message', message => {
      setMessages(msgs => [...msgs, message]);
    });
  }, [])

  useEffect(() => {
    // console.log(participants)
  },[participants])

  const sendNotify = () => {
    socket.emit('sendNotify', tokenContractAddr, () => null);
  }

  const updateGame = async (data) => {
    const res = await fetch('/api/games', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, gameId }),
    });
    if (res.status === 200) {
      const resp = await res.json();
      setGameStatus(resp.game.status);
      setGameData(resp.game);
      setStartPoint(resp.game.startPoint)
      return resp.game;
    } else {
      return false;
    }
  };

  const updateInviteById = async (data) => {
    await fetch('/api/invites', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data }),
    });
  }

  const invitePlayer = async (player2) => {
    let body = { gameId, player2: player2._id };
    let res = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status === 200) {
      const resp = await res.json();
      const inviteId = resp.invite._id;
      // Update games
      body = { gameId, status: GAME_INVITING, player2: player2._id, inviteId };
      socket.emit('invite', player2._id);
      toast.info(`Invitation sent to ${player2.value}.`);
    } else {
      const text = await res.text()
      toast.error(text);
    }
  };

  const handlePlayerChange = (player) => {
    setSelectedPlayer(player);
  }

  const handleSendInvite = () => {
    invitePlayer(selectedPlayer);
  }

  const handlePlayerReady = async (event, num) => {
    event.preventDefault();
    if (gameObj.creatorId == user._id && num != 1) {
      return;
    }

    if (gameObj.player2 == user._id && num != 2) {
      return;
    }

    if (gameStatus == GAME_ACCEPTED) {
      const data = { gameId, status: num == 1 ? GAME_PLAYER1_READY : GAME_PLAYER2_READY };
      await updateGame(data);
      sendNotify()
      return;
    }
    if (gameStatus == GAME_PLAYER1_READY || gameStatus == GAME_PLAYER2_READY) {
      const data = { gameId, status: GAME_SET_CONTRACT };
      await updateGame(data);
      sendNotify()
      return;
    }
  };

  const handleReadyToBegin = async (event, num) => {
    event.preventDefault();

    let data = {};

    const accounts = await web3.eth.getAccounts();
    const child = Child(tokenContractAddr);

    switch (num) {
      case 1:
        if (gameObj.creatorId == user._id) {
          toast.info('Waiting for confirmation...')

          await child.methods.readyToCompete().send({
            from: accounts[0]
          });

          data = { status: GAME_P1_READY };
          await updateGame(data)
          sendNotify()

          toast.info('Ready to compete confirmation recorded')
        }
        break;
      case 2:
        if (gameObj.player2 == user._id && gameStatus == GAME_P1_READY) {
          toast.info('Waiting for confirmation...')

          await child.methods.readyToCompete().send({
            from: accounts[0]
          });

          data = { status: GAME_P2_READY };
          await updateGame(data);
          sendNotify();

          toast.info('Ready to compete confirmation recorded')
        }
        break;
      case 3:
        if (gameObj.creatorId != user._id && gameObj.player2 != user._id && gameStatus == GAME_P2_READY) {
          toast.info('Waiting for confirmation...')

          await child.methods.refTakescontrol().send({
            from: accounts[0]
          });

          data = { status: GAME_PLAYING_NOW };
          await updateGame(data)
          sendNotify()

          toast.info('Ready to compete confirmation recorded')
        }
        break;
    }
  };

  const handleCompete4ESRtoken = (event) => {
    event.preventDefault();
    // generate smart contract to competer for ESR token
    return;
  };

  const handleCompete4HPBcrypto = async (event) => {
    event.preventDefault();
    // generate smart contract to competer for HPB crypto
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    console.log('account:', account);
    await FactoryContract.methods.newSpawnHPBContract().send({ from: account });
    const contractAddr = await FactoryContract.methods.getLatestSpawnedContract().call();
    setContractAddress(contractAddr);
    await updateGame({ contractAddr });
    // should be generated and used from global scope
    ESRContract = new Web3.eth.Contract(templateAbi, contractAddr);
    sendNotify();

    return;
  };

  const handleFirstDeposit = async (e) => {
    e.preventDefault();
    toast.info('Waiting for confirmation...')

    const game_name = e.currentTarget.game_name.value;
    const stake_amount = e.currentTarget.stake_amount.value;

    const accounts = await web3.eth.getAccounts();
    const child = Child(tokenContractAddr);
  
    await child.methods.firstDeposit(game_name).send({
      from: accounts[0], value: web3.utils.toWei(stake_amount, 'ether')
    });

    await updateGame({ stake_amount: stake_amount, status: GAME_FIRST_DEPOSITED });
    sendNotify();

    toast.info('First deposit successful and game name registered!')
  };

  const handleSecondDeposit = async (e) => {
    e.preventDefault();
    toast.info('Waiting on transaction success...')

    let staked_amount = 0;
    const res = await fetch('/api/games?id=' + gameId);
    if (res.status === 200) {
      const resp = await res.json();
      staked_amount = resp.game.stake_amount;
    }

    if (!staked_amount) {
      alert('Can not read staked amount!');
      return;
    }

    const accounts = await web3.eth.getAccounts();
    const child = Child(tokenContractAddr);
  
    await child.methods.secondDeposit().send({
      from: accounts[0],
      value: web3.utils.toWei(staked_amount, 'ether')
    });

    // get random number for referee selection
    const ranNum = await child.methods.randomNumber().call();
    setRefRandomNumber(ranNum);

    // get online referee id
    const selectedReferee = ranNum % onlineReferees.length;
    const referee = onlineReferees[selectedReferee]?._id;
    await updateGame({ status: GAME_WAIT_REFEREE, referee, refRandomNumber: ranNum });
    await updateInviteById({ inviteId, referee });
    socket.emit('invite', referee);
    sendNotify();

    toast.info('Second deposit successful')
  };

  const handleGiveup = async (e) => {
    e.preventDefault();
    toast.info('Waiting for confirmation...')

    const accounts = await web3.eth.getAccounts();
    const child = Child(tokenContractAddr);
    // give up competition and coin will be awarded to the other party
    await child.methods.player_forfeit().send({
      from: accounts[0]
    });

    await updateGame({ status: GAME_REF_JUDGED });
    sendNotify();

    toast.info('Player has conceded')
  };

  const handleRefereeDecide = async (e, mode) => {
    e.preventDefault();

    const accounts = await web3.eth.getAccounts();
    const child = Child(tokenContractAddr);

    toast.info('Waiting for confirmation...')

    if (mode == 1) {
      // player 1 wins
      await child.methods.setWinnerPlayerA().send({
        from: accounts[0]
      });

      await updateGame({ loser: gameData.player2, status: GAME_REF_JUDGED });
      sendNotify();

      toast.info('Referee declares player 1 the winner')
    } else if (mode == 2) {
      // player 2 wins
      await child.methods.setWinnerPlayerB().send({
        from: accounts[0]
      });

      await updateGame({ loser: gameData.creatorId, status: GAME_REF_JUDGED });
      sendNotify();

      toast.info('Referee declares player 2 the winner')
    } else if (mode == 0) {
      // game is draw
      await child.methods.setResultDraw().send({
        from: accounts[0]
      });

      await updateGame({ status: GAME_REF_JUDGED });
      sendNotify();

      toast.info('Referee declares the game a draw')
    }
  };

  const handleDispute = async (e) => {
    e.preventDefault();
    toast.info('Waiting for confirmation...')

    const accounts = await web3.eth.getAccounts();
    const child = Child(tokenContractAddr);

    // dispute the referee result
    await child.methods.disputeResult().send({
      from: accounts[0]
    });

    await updateGame({ status: GAME_UNDER_DISPUTE, disputer: currentUser.name, tokenContractAddr });
    sendNotify();

    toast.info('Player has disputed the result')
  };

  const handleAddReferee = async () => {
    toast.info('Waiting on transaction success...')

    const accounts = await web3.eth.getAccounts();
    const child = Child(tokenContractAddr);

    await child.methods.refAddedToContract().send({
      from: accounts[0]
    });

    toast.info('Referee has been added to contract')
  }

  const handlePayout = async () => {
    toast.info('Waiting for confirmation...')

    const accounts = await web3.eth.getAccounts();
    const child = Child(tokenContractAddr);
    await child.methods.payoutWinner().send({
      from: accounts[0]
    });

    await updateGame({ status: GAME_FINISHED });
    sendNotify();

    toast.info('Winner has been paid')
  }

  const handleSendDisputeMail = async () => {
    const emailText = emailTextRef.current.value;
    if (!emailText) {
      alert('Please input your report message');
      return;
    }

    await updateGame({ status: GAME_ADMINS_CHECKING, disputer: currentUser.name, disputeText: emailText, tokenContractAddr });
    sendNotify();
  }

  // Action Area which include buttons for players and referee
  function ActionArea(props) {
    const status = props.status;

    if (status == GAME_ACCEPTED) {
      return (
        <>
          <h2 className="mt-3 text-xl text-center">Players - click when ready</h2>
          <div className="flex justify-center gap-4 p-4">
            <button className="px-6 py-3 text-lg bg-green-500" onClick={(e) => handlePlayerReady(e, 1)}>
              Player 1 - not ready
            </button>
            <button className="px-6 py-3 text-lg bg-green-500" onClick={(e) => handlePlayerReady(e, 2)}>
              Player 2 - not ready
            </button>
          </div>
        </>
      );
    } else if (status == GAME_PLAYER1_READY) {
      return (
        <>
          <h2 className="mt-3 text-xl text-center">Players - click when ready</h2>
          <div className="flex justify-center gap-4 p-4">
            <button className="px-6 py-3 text-lg bg-green-500">
              Player 1 is ready
            </button>
            <button className="px-6 py-3 text-lg bg-green-500" onClick={(e) => handlePlayerReady(e, 2)}>
              Player 2 - ready
            </button>
          </div>
        </>
      );
    } else if (status == GAME_PLAYER2_READY) {
      return (
        <>
          <h2 className="mt-3 text-xl text-center">Players - click when ready</h2>
          <div className="flex justify-center gap-4 p-4">
            <button className="px-6 py-3 text-lg bg-green-500" onClick={(e) => handlePlayerReady(e, 1)}>
              Player 1 - not ready
            </button>
            <button className="px-6 py-3 text-lg bg-green-500">
              Player 2 is ready
            </button>
          </div>
        </>
      );
    } else if (status == GAME_ON_CONTRACT) {
      if (currentUser._id == gameData.creatorId) {
        return (
          <div className="flex flex-col justify-center gap-4 p-4">
            <button className="px-6 py-3 text-lg bg-green-500" onClick={(e) => handleCompete4ESRtoken(e)}>
              Compete for ESR tokens
            </button>
            <button className="px-6 py-3 text-lg bg-blue-500" onClick={(e) => handleCompete4HPBcrypto(e)}>
              Compete for HPB crypto
            </button>
            <h1 className="flex justify-center">In some regions, law may prohibit this option</h1>
          </div>
        );
      } else {
        return (
          <div className="flex flex-col justify-center gap-4 p-4">
            <h1 className="flex justify-center">Contract is being generated...</h1>
          </div>
        );
      }
    } else if (status == GAME_SET_CONTRACT) {
      if (currentUser._id == gameData.creatorId) {
        return (
          <div>
            <form onSubmit={handleFirstDeposit} className="p-4">
              <div className="grid grid-cols-2 my-4">
                <h2 className="flex items-center justify-end px-4">Name of Game :</h2>
                <input
                  id="game_name"
                  name="game_name"
                  className="block w-full p-1 bg-transparent border-b-2 border-yellow-900 outline-none"
                  placeholder="input game name"
                  minLength={3}
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 my-4">
                <h2 className="flex items-center justify-end px-4">Amount of HPB you wish to compete for :</h2>
                <div className="flex items-center">
                  <input
                    id="stake_amount"
                    name="stake_amount"
                    className="block w-full p-1 bg-transparent border-b-2 border-yellow-900 outline-none"
                    placeholder="input HPB amount"
                    minLength={1}
                    min={1}
                    type="number"
                  />
                </div>
              </div>
              <div className="ml-3 text-center mt-7">
                <button type="submit" className="py-2 text-white bg-transparent border-2 border-yellow-900 px-7 hover:bg-gray-800">Deposit your HPB</button>
              </div>
            </form>
          </div>
        );
      } else {
        return (
          <div className="flex justify-center gap-4 p-4">
            <h1 className="flex justify-center">Player 1 is going to deposit now.</h1>
          </div>
        );
      }
    } else if (status == GAME_FIRST_DEPOSITED) {
      if (currentUser._id == gameData.player2) {
        // request second player to deposit
        return (
          <div className="">
            <h1 className="">Player 1 deposited HPB to compete. Player 2 now has 5 minutes to deposit the same amount.</h1>
            <button
              className="px-6 py-3 mt-3 text-lg bg-green-500"
              onClick={(e) => handleSecondDeposit(e)}
            >
              Deposit your HPB
            </button>
          </div>
        );
      } else {
        return (
          <div className="flex justify-center gap-4 p-4">
            <h1 className="flex justify-center">Player 2 is going to deposit now.</h1>
          </div>
        );
      }
    } else if (status == GAME_WAIT_REFEREE) {
      if (currentUser._id == gameData.player2 || currentUser._id == gameData.creatorId) {
        return (
          <div className="">
            <h1 className="mt-3 text-xl">A random number was retrieved from the smart contract.</h1>
            <h2 className="flex mt-5 text-2xl">This number is: {refRandomNumber}</h2>
            <p className="mt-5 text-xl">Our special calculation will use this number to randomly invite a referee to your game. The referee will join you shortly.</p>
          </div>
        );
      } else {
        return (
          <div className="">
            <h2 className="mt-3 text-xl">You can manage only your game.</h2>
          </div>
        )
      }
    } else if (status == GAME_PLAY_READY) {
      return (
        <>
          {currentUser.user_type === "referee" && (
            <div className="mb-8 space-y-4 text-lg">
              <h2>{currentUser.name} you have now joined the chat!</h2>
              <h2>Your wallet address is: <span className="text-blue-400">{currentUser.hpbwallet}</span></h2>
              <h2>Before the game begins, please introduce yourself to the players and then add yourself to the smart contract.</h2>
              <div className="flex justify-center">
                <button className="px-6 py-3 text-2xl font-bold uppercase bg-blue-600" onClick={handleAddReferee}>
                  Join contract
                </button>
              </div>
            </div>
          )}
          <h2 className="my-3 text-xl text-center">Please click when you are ready</h2>
          <div className="flex justify-center gap-4 p-4">
            <button className="px-6 py-3 text-lg bg-green-500" onClick={(e) => handleReadyToBegin(e, 1)}>
              Player 1 Not Ready
            </button>

            <button className="px-6 py-3 text-lg bg-green-500">
              Player 2 Not Ready
            </button>

            <button className="px-6 py-3 text-lg bg-green-500">
              Referee Not Ready
            </button>
          </div>
        </>
      );
    } else if (status == GAME_P1_READY) {
      return (
        <>
          {currentUser.user_type === "referee" && (
            <div className="mb-8 space-y-4 text-lg">
              <h2>{currentUser.name} you have now joined the chat!</h2>
              <h2>Your wallet address is: <span className="text-blue-400">{currentUser.hpbwallet}</span></h2>
              <h2>Before the game begins, please introduce yourself to the players and then add yourself to the smart contract.</h2>
              <div className="flex justify-center">
                <button className="px-6 py-3 text-2xl font-bold uppercase bg-blue-600" onClick={handleAddReferee}>
                  Join contract
                </button>
              </div>
            </div>
          )}
          <h2 className="my-3 text-xl text-center">Please click when you are ready</h2>
          <div className="flex justify-between gap-3">
            <button className="px-6 py-3 text-lg bg-green-500">
              Player 1 is Ready
            </button>

            <button className="px-6 py-3 text-lg bg-green-500" onClick={(e) => handleReadyToBegin(e, 2)}>
              Player 2 Not Ready
            </button>

            <button className="px-6 py-3 text-lg bg-green-500">
              Referee Not Ready
            </button>
          </div>
        </>
      )
    } else if (status == GAME_P2_READY) {
      return (
        <>
          {currentUser.user_type === "referee" && (
            <div className="mb-8 space-y-4 text-lg">
              <h2>{currentUser.name} you have now joined the chat!</h2>
              <h2>Your wallet address is:  <span className="text-blue-400">{currentUser.hpbwallet}</span></h2>
              <h2>Before the game begins, please introduce yourself to the players and then add yourself to the smart contract.</h2>
              <div className="flex justify-center">
                <button className="px-6 py-3 text-2xl font-bold uppercase bg-blue-600" onClick={handleAddReferee}>
                  Join contract
                </button>
              </div>
            </div>
          )}
          <h2 className="my-3 text-xl text-center">Please click when you are ready</h2>
          <div className="flex justify-between gap-3">
            <button className="px-6 py-3 text-lg bg-green-500">
              Player 1 is Ready
            </button>

            <button className="px-6 py-3 text-lg bg-green-500">
              Player 2 is Ready
            </button>

            {gameData.ref !== 'ready' ? (
              <button className="px-6 py-3 text-lg bg-green-500" onClick={(e) => handleReadyToBegin(e, 3)}>
                Referee Not Ready
              </button>
            ) : (
              <button className="px-6 py-3 text-lg bg-green-500">
                Referee is Ready
              </button>
            )}
          </div>
        </>
      )
    } else if (status == GAME_PLAYING_NOW) {
      if (currentUser._id == gameData.creatorId || currentUser._id == gameData.player2) {
        return (
          <div className="flex gap-4 p-4">
            <button className="px-6 py-3 text-lg bg-green-500" onClick={(e) => handleGiveup(e)}>
              I Give up!
            </button>
          </div>
        );
      } else if (currentUser._id != gameData.creatorId && currentUser._id != gameData.player2) {
        return (
          <div className="flex gap-4 p-4">
            <button className="px-6 py-3 text-lg bg-green-500" onClick={(e) => handleRefereeDecide(e, 1)}>
              Player 1 wins
            </button>
            <button className="px-6 py-3 text-lg bg-blue-500" onClick={(e) => handleRefereeDecide(e, 0)}>
              Draw
            </button>
            <button className="px-6 py-3 text-lg bg-green-500" onClick={(e) => handleRefereeDecide(e, 2)}>
              Player 2 wins
            </button>
          </div>
        );
      }
    } else if (status == GAME_REF_JUDGED) {
      if (currentUser.user_type == "player") {
        // Renderer callback with condition
        const renderer = ({ minutes, seconds, completed }) => {
          if (completed) {
            // Render a complete state
            
            updateGame({ status: GAME_PAYOUT_WINNER });
            sendNotify();

            return <span></span>;
          } else {
            // Render a countdown
            return (
              <span>
                {zeroPad(minutes)}:{zeroPad(seconds)}
              </span>
            );
          }
        };

        return (
          <div>
            {gameData.winner ? (
              <p>The referee has awarded the result to: {gameData.winner == gameData.creatorId ? 'Player 1' : 'Player 2'}</p>
            ) : (
              <p>The referee has judged the game is draw.</p>
            )}
            <div className="flex justify-center gap-4 p-4">
              <button className="px-6 py-3 text-lg bg-red-500" onClick={(e) => handleDispute(e)}>
                <p>
                  <i className="fa fa-spinner fa-spin"></i>{' '}
                  <Countdown date={startPoint + REMAINING_TIME_TO_DISPUTE} renderer={renderer} />{' '}left to dispute
                </p>
                <p>I wish to dispute this result</p>
              </button>
            </div>
          </div>
        );
      } else {
        // Renderer callback with condition
        const renderer = ({ minutes, seconds, completed }) => {
          if (completed) {
            // Render a complete state

            return <span></span>;
          } else {
            // Render a countdown
            return (
              <span>
                {zeroPad(minutes)}:{zeroPad(seconds)}
              </span>
            );
          }
        };
        
        return <div>
          <h3 className="mt-2">Please wait for disputing</h3>
          <div className="mt-5 text-2xl">
            <Countdown date={startPoint + REMAINING_TIME_TO_DISPUTE} renderer={renderer} />{' '}left to dispute
          </div>
        </div>
      }
    } else if (status == GAME_UNDER_DISPUTE) {
      if (gameData.disputer == currentUser.name) {
        return (
          <div>
            <h2 className="mt-2 text-2xl">The referee result is now under dispute.</h2>
            <button className="px-6 py-3 my-2 text-lg bg-red-500" disabled>You have chosen to dispute the result</button>
            <p>If you wish to supply any further information to the admins to support your case, please add it below. Ensure you have the link to hte stream and point out where on the video timeline admins should focus to help speed up the decision. Admins wil carefully review your case, and will make a decision within 24 hours.</p>
            <textarea rows={6} className="block w-full p-2 mt-5 text-lg text-black" ref={emailTextRef} />
            <button
              className="block px-6 py-3 mx-auto mt-3 text-lg bg-green-500"
              onClick={handleSendDisputeMail}
            >
              Send Mail to Admins
            </button>
          </div>
        );
      } else {
        return (
          <div>
            <p><span className="px-2 bg-red-500 rounded">{gameData.disputer}</span>&nbsp;is disputing now.</p>
          </div>
        )
      }
    } else if (status == GAME_ADMINS_CHECKING) {
      return (
        <div>
          <h2 className="mt-2 text-2xl">Admins will check in 24 hours</h2>
          <p className="mt-3 text-xl">The admis will now dispute material. You will receive an email once a decision has been made. Please allow up to 24 hours for the review process to take place.</p>
        </div>
      )
    } else if (status ==  GAME_DISPUTE_RESOLVED) {
      return (
        <div>
          <h2 className="my-2 text-2xl">Admins resolved your dispute</h2>
          <p className="text-xl"><span className="px-2 bg-red-500 rounded">{gameData.winner}</span>&nbsp;is winner!</p>
        </div>
      )
    } else if (status == GAME_PAYOUT_WINNER) {
      return (
        <div>
          <h1 className="text-xl">Please payout now</h1>
          <button
            className="px-10 py-2 mt-3 text-lg bg-green-500"
            onClick={handlePayout}
          >
            Payout
          </button>
        </div>
      )
    } else if (status == GAME_FINISHED) {
      if (currentUser._id == gameData.loser) {
        return (
          <div className="mt-3 text-xl">
            <h1 className="text-2xl">Sorry!</h1>
            <h1 className="mt-3 text-xl">Next time, you will win surely.</h1>
          </div>
        )
      } else {
        return (
          <div className="mt-3">
            <h1 className="text-2xl">Congratulations!</h1>
            <h1 className="mt-3 text-xl">This compete is finished!</h1>
          </div>
        )
      }
    } 

    return null;
  }

  const sendMessage = (event) => {
    event.preventDefault();
    message && socket.emit('sendMessage', message, () => setMessage(''));
  }

  return (
    <>
      <Head>
        <title>Compete for HPB crypto | ESportsRef</title>
      </Head>
      {!user ? (
        <Link href="/login">
          <a>
            <h2 className="flex justify-center pt-8 text-2xl">Sign in first, please.</h2>
          </a>
        </Link>
      ) : (
        <div>
          <div className="flex flex-col justify-center gap-5 p-8 lg:flex-row">
            <ParticipantContainer participants={participants} />
            <Chat
              name={user.name}
              message={message}
              setMessage={setMessage}
              messages={messages}
              sendMessage={sendMessage}
            />
            <div className="w-1/3">
              {currentUser._id == gameData.creatorId && (
                <>
                  <div className="flex justify-between">
                    <Select
                      className="w-4/6 mr-3 text-black"
                      isSearchable={true}
                      placeholder="Select player name"
                      value={selectedPlayer}
                      options={playerList}
                      onChange={handlePlayerChange}
                    />
                    <button
                      className="w-2/6 px-3 border-2 border-yellow-900 hover:bg-gray-800"
                      onClick={handleSendInvite}
                    >
                      Send Invite
                    </button>
                  </div>

                  <p className="mt-6 mb-3 text-sm">Alternatively, you can send someone the followig link if you want them to join you.</p>
                  <TheCopyboardStyle />
                  <TheCopyboard className="w-full" text={`${process.env.WEB_URI + router.asPath}`}
                    tipText='Copied to clipboard'
                  >
                  </TheCopyboard>
                </>
              )}

              <ActionArea status={gameStatus} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export async function getServerSideProps(context) {
  await all.run(context.req, context.res);

  const user = extractUser(await findUserById(context.req.db, context.req.user?._id));
  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  const tokenContractAddr = context.params.tokenContractAddr;

  const chatHistory = await findChatHistoryByRoom(context.req.db, tokenContractAddr?.trim().toLowerCase());

  const players = await getPlayers(context.req.db);
  const game = await findGameByTokenContractAddress(context.req.db, tokenContractAddr);
  const gameId = game?._id;

  if (!gameId) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  const onlineReferees = await getOnlineReferees(context.req.db);

  return { props: { gameId, game: JSON.stringify(game), tokenContractAddr, chatHistory: JSON.stringify(chatHistory), players, currentUser: user, onlineReferees } }
}
