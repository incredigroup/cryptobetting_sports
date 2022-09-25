import React from 'react';
import Head from 'next/head';
import Collapsible from 'react-collapsible';

const FAQPage = () => {

  return (
    <>
      <Head>
        <title>FAQ | ESportsRef</title>
      </Head>
      <div className="px-8 mx-8">
        <h2 className="flex justify-center text-5xl yellow-title pt-8 mt-8">FAQ</h2>
        <div className="py-4 px-8 mx-8">
          <Collapsible trigger="+ QUESTION" triggerWhenOpen="- QUESTION" >
            <p>
            Answer: If you are completely new to the world of Crypto and Blockchain, then HPB might be a new term to you. HPB stands for “High-Performance Blockchain”, and the blockchain itself consists of multiple servers (also known as “nodes”) scattered around the globe, all connected together to form a blockchain network.
            </p>
          </Collapsible>
        </div>
        <div className="pb-4 px-8 mx-8">
          <Collapsible trigger="+ QUESTION" triggerWhenOpen="- QUESTION" >
            <p>
            Answer: If you are completely new to the world of Crypto and Blockchain, then HPB might be a new term to you. HPB stands for “High-Performance Blockchain”, and the blockchain itself consists of multiple servers (also known as “nodes”) scattered around the globe, all connected together to form a blockchain network.
            </p>
          </Collapsible>
        </div>
        <div className="pb-4 px-8 mx-8">
          <Collapsible trigger="+ QUESTION" triggerWhenOpen="- QUESTION" >
            <p>
            Answer: If you are completely new to the world of Crypto and Blockchain, then HPB might be a new term to you. HPB stands for “High-Performance Blockchain”, and the blockchain itself consists of multiple servers (also known as “nodes”) scattered around the globe, all connected together to form a blockchain network.
            </p>
          </Collapsible>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
