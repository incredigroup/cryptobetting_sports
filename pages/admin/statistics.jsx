import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { useCurrentUser } from '@/hooks/index';
import { all } from '@/middlewares/index';
import { getUsers } from '@/db/index';
import AdminSidebar from '@/components/AdminSidebar';
import Table from '@/components/Table';

export default function AdminStatisticsPage({ users }) {
  const [user] = useCurrentUser();
  const [playerStats, setPlayerStats] = useState([]);
  const [refereeStats, setRefereeStats] = useState([]);

  const players = users.filter( u => u.user_type == 'player');
  const referees = users.filter( u => u.user_type == 'referee');

  const getStats = async () => {
    const res = await fetch('/api/stats');
    if (res.status === 200) {
      const resp = await res.json();
      const pStats = players.map( p => {
        if (p._id in resp.result) {
          return {
            _id: p._id,
            name: p.name,
            challenges: resp.result[p._id].created + resp.result[p._id].joined,
            wins: resp.result[p._id].wins,
            losses: resp.result[p._id].losses,
            draws: resp.result[p._id].draws,
            tokenStaked: resp.result[p._id].tokenStaked,
            tokenBalance: resp.result[p._id].tokenBalance,
            hpbAwarded: resp.result[p._id].hpbAwarded,
            hpbBalance: resp.result[p._id].hpbBalance,
          };
        }
      });
      setPlayerStats( pStats.filter( p => p) );
      const rStats = referees.map( r => {
        if (r._id in resp.result) {
          return {
            _id: r._id,
            name: r.name,
            challenges: resp.result[r._id].judged,
            disputes: resp.result[r._id].disputes,
            tokenStaked: resp.result[r._id].tokenStaked,
            tokenBalance: resp.result[r._id].tokenBalance,
            hpbAwarded: resp.result[r._id].hpbAwarded,
            hpbBalance: resp.result[r._id].hpbBalance,
          };
        }
      });
      setRefereeStats( rStats.filter( r => r) );
    } else {
      console.log('error', await res.text());
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  const pColumns = [
    {
      Header: 'Name',
      accessor: 'name', // accessor is the "key" in the data
    },
    {
      Header: 'Challenges',
      accessor: 'challenges',
    },
    {
      Header: 'Wins',
      accessor: 'wins',
    },
    {
      Header: 'Losses',
      accessor: 'losses',
    },
    {
      Header: 'Draws',
      accessor: 'draws',
    },
    {
      Header: 'Tokens Staked',
      accessor: 'tokenStaked',
    },
    {
      Header: 'Token Balance',
      accessor: 'tokenBalance',
    },
    {
      Header: 'HPB Awarded',
      accessor: 'hpbAwarded',
    },
    {
      Header: 'HPB Balance',
      accessor: 'hpbBalance',
    },
  ];

  const rColumns = [
    {
      Header: 'Name',
      accessor: 'name', // accessor is the "key" in the data
    },
    {
      Header: 'Challenges',
      accessor: 'challenges',
    },
    {
      Header: 'Disputes',
      accessor: 'disputes',
    },
    {
      Header: 'Tokens Staked',
      accessor: 'tokenStaked',
    },
    {
      Header: 'Token Balance',
      accessor: 'tokenBalance',
    },
    {
      Header: 'HPB Awarded',
      accessor: 'hpbAwarded',
    },
    {
      Header: 'HPB Balance',
      accessor: 'hpbBalance',
    },
  ];

  const StatisticsSection = () => {
    const [user, { mutate }] = useCurrentUser();
  
    return (
      <>
        <Head>
          <title>Admin | Statistics</title>
        </Head>
        <section className="py-8 col-span-5 h-screen overflow-y-scroll">
          <h2 className="flex justify-center text-3xl pt-5">Admin - Statistics</h2>
          <div className="pl-4">
          <Tabs>
            <TabList>
              <Tab>Players</Tab>
              <Tab>Referees</Tab>
            </TabList>
            <TabPanel>
              <Table columns={pColumns} data={playerStats}/>
            </TabPanel>
            <TabPanel>
              <Table columns={rColumns} data={refereeStats}/>
            </TabPanel>
          </Tabs>
          </div>
        </section>
      </>
    );
  };

  if (!user) {
    return (
      <>
        <h2 className="flex justify-center text-2xl pt-8">You are not allowed to access this page.</h2>
      </>
    );
  }
  return (
    <>
      <div className='grid grid-cols-6'>
        <AdminSidebar />
        <StatisticsSection />
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  await all.run(context.req, context.res);
  let users = await getUsers(context.req.db);
  if (context.req.user) {
    users = users.filter(user => user._id !== context.req.user._id);
  }

  return { props: { users } };
}
