import React from 'react';
import Head from 'next/head';

const SmartContractsPage = () => {

  return (
    <>
      <Head>
        <title>Smart Contracts | ESportsRef</title>
      </Head>
      <div className="container">
        <h2 className="flex justify-center text-5xl yellow-title pt-8 mt-8">SMART CONTRACTS</h2>
        <h1 className="yellow-title text-2xl mx-8 px-8">FOR HPB CRYPTO!</h1>
        <p className="py-6 px-8 mx-8">
        A smart contract is a “self-executing” contract with the terms of multiple parties being directly written into lines of code. The code and the agreements contained within the contract exist on a blockchain network. The code within the smart contract controls the execution of the contract terms, and once executed, those transactions are easily trackable, yet also cannot be reversed.
        </p>
        <h1 className="yellow-title text-2xl mx-8 px-8">WHAT PROGRAMMING CODE ARE SMART CONTRACTS WRITTEN IN?</h1>
        <p className="py-6 px-8 mx-8">
        Smart contracts can be written in JavaScript, C++, Golang and Solidity. The EsportsRef smart contracts use Solidity-based smart contracts, and if you wanted to review the contract code, which is of course fully open-source for transparency, you can visit our GitHub.
        </p>
        <h1 className="yellow-title text-2xl mx-8 px-8">HOW DO YOU INTERACT WITH SMART CONTRACTS?</h1>
        <p className="py-6 px-8 mx-8">
        You require the use of a “Web3” browser, or alternatively a standard browser running a Web3 extension. Most people use the MetaMask extension for Chrome and Edge to interact with smart contracts.
        </p>
        <h1 className="yellow-title text-2xl mx-8 px-8">WHERE ARE ALL THE SMART CONTRACTS STORED?</h1>
        <p className="py-6 px-8 mx-8">
        Multiple copies of the Smart Contracts are stored on the blockchain. In the case of our service, the contracts are specifically stored on the HBP blockchain. Each and every smart contract created will have a unique contract ID, and these can be found using a Blockchain scanner such as https://hpbscan.org
        </p>
        <h1 className="yellow-title text-2xl mx-8 px-8">WHY DO I HAVE TO PAY A TINY FEE EACH TIME I GENERATE A SMART CONTRACT TO PLAY A GAME?</h1>
        <p className="py-6 px-8 mx-8">
        The fractional amount paid (less than $0.01) to generate each new smart contract is the “gas” fee required to allow for any blockchain-based transaction. Remember that a blockchain, is essentially a global network of servers (also referred to as “nodes”) and these are run by individuals who have fees associated with running their servers, such as electricity and internet connectivity. The fractional “gas” fee goes towards keeping the nodes on the blockchain running.
        </p>
      </div>
    </>
  );
};

export default SmartContractsPage;
