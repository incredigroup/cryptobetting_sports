import React from 'react';
import { useCurrentUser } from '@/hooks/index';
// import PostEditor from '@/components/post/editor';
// import Posts from '@/components/post/posts';
import Carousel from "react-multi-carousel";
import Image from 'next/image'
import Head from 'next/head';
import "react-multi-carousel/lib/styles.css";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
};

const CarouselImage = ({ url, alt }) => (
  <img draggable={false} style={{ width: '100%', height: '100%',position: 'relative'}} src={url} alt={alt} />
)
const images = [
  '/images/slider-1.jpg',
  '/images/slider-2.jpg',
  '/images/slider-3.jpg',
  '/images/slider-4.jpg',
  '/images/slider-5.jpg',
];
images

const streaming_images = [
  '/images/twitch-banner-360x260.jpg',
  '/images/YouTube-Gaming-Logo-360x260.jpg',
  '/images/imageedit_15_9951504113.jpg',
];
const IndexPage = () => {
  // const [user] = useCurrentUser();

  return (
    <>
      <style jsx>
        {`
          .stream-img {
            width: 100%;
            height: 100%;
            position: relative;
          }
          .alignleft {
            float: left;
            margin-right: 1.5em;
          }
          .alignright {
            float: right;
            margin-left: 1.5em;
          }
          .post-img {
            height: auto;
            max-width: 100%;
            vertical-align: middle;
            border: 0;
          }
          .slider-img {
            width: 700px;
            height: 300px;
          }
          iframe {
            width: 100%;
          }
          .youtube-wrapper {
            width: 80%;
          }
          .vc_progress-bar {
            background: #FFF;
            position: relative;
          }
          .vc_bar {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
          }
          .vc_label, vc_label_units {
            color: #fff;
            display: block;
            padding: .5em 1em;
            position: relative;
            z-index: 1;
          }
          .analytic {
            width: 80%;
          }
          blockquote {
            position: relative;
            margin-left: 25px;
            padding-left: 28px;
          }
          blockquote p:before {
            content: '';
            margin-right: 15px;
            background-color: #fff;
            background-position: center;
            border-radius: 50%;
            display: block;
            position: absolute;
            top: -8px;
            left: -24px;
            height: 48px;
            width: 48px;
          }
          blockquote:before, q:before {
            background: rgba( 255, 255, 255, 1 );
            content: '';
            background-color: #fff;
            display: block;
            position: absolute;
            top: 50%;
            left: 0;
            width: 4px;
            height: calc( 100% - 20px );
            min-height: 30px;
            -webkit-transform: translateY(-50%);
            -ms-transform: translateY(-50%);
            -o-transform: translateY(-50%);
            transform: translateY(-50%);
          }
          .index-content {
            padding: 1rem;
            max-width: 1140px;
            margin: 0 auto;
          }
        `}
      </style>
      <Head>
        <title>ESports for Crypto | ESportsRef</title>
      </Head>
      <Carousel responsive={responsive} className="">
        {images.map(url => {
          return <img className="slider-img" draggable={false} src={url} key={url} />;
        })}
      </Carousel>
      <div className="index-content">
        <h2 className="flex justify-center text-5xl yellow-title">Compete Online</h2>
        <div className='flex justify-center mt-5 mb-3'>
          <figure className="flex self-center">
            <div className="space-y-4 text-center md:text-left">
              <h1 className="text-4xl yellow-title">For HPB Crypto or ESR Tokens</h1>
            </div>
          </figure>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {streaming_images.map(url => {
            return <img className="stream-img" draggable={false} src={url} key={url} />;
          })}
        </div>
        <div className="text-left wpb_wrapper">
          <div className='mt-5'>
            <h1 className="mb-5 text-2xl uppercase yellow-title">Want to make your online e-sports gaming a little more…. interesting?</h1>
          </div>
          <p className="mb-3 text-left">If you fancy playing a buddy or even a complete stranger at a game you love, and you like the idea of placing a real wager on the outcome, eSportsRef.com can help.</p>
          <p className="mb-1 text-left">We help match up like-minded gamers who want to play each other for crypto, and in order to do that completely fairly, we offer the services of our huge team of completely anonymous and completely neutral and unbiased eSports Referees, who will watch you play your game via a <strong>Twitch, YouTube Gaming, or Facebook Gaming</strong>&nbsp;live stream, and decide on the winner!</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 wpb_wrapper">
            <p className="mt-2">E-Sports players and casual gamers can either compete for HPB (High-Performance Blockchain) crypto, or alternatively compete for native esportsref.com ESR tokens! 
              When players are ready to play, they each deposit an equal sum of HBP (or ESR) into a secure “smart contract” stored on the HPB blockchain. You can think of this smart contract
            as a type of escrow wallet, that has some very smart capabilities built into it.</p>
            <p>&nbsp;</p>
            <p className="mb-5">Once both players have stored their HPB/ESR into the smart contract, 
              esportsref will appoint a referee who loves watching others play games online!</p>
            <p>&nbsp;</p>
            <p className="mb-4">The referee will already be online and available, and will be immediately notified via email and instant message of a pending game 
            which they have been asked to referee!</p>
            <p>&nbsp;</p>
            <h1 className="my-4 text-lg yellow-title">STEP 1</h1>
            <p>To get started, players provide the referee any specific rules they wish to play to, together with their live stream URL ready for the referee to connect to. 
            The referee will be watching the game throughout.</p>
            <h1 className="my-4 text-lg yellow-title">STEP 2</h1>
            <p>Both the players and the E-sports referee will confirm they are ready to proceed, which locks the escrow into the wallet, and the referee will have 
            full control of the “smart contract” (escrow wallet) apart from the ability for a player to click on the “<strong>I CONCEDE</strong>” button, 
            which will result in immediate payment of funds being issued to the other player. This is useful if you are losing badly and 
            just want to quit out to play a different game.</p>
            <h1 className="my-4 text-lg yellow-title">STEP 3</h1>
            <p>Once the game ends, the e-sports referee will determine a winner, and release the funds to the correct player. If the game results in a draw, 
            the funds will be split and sent to both players.</p>
            <p>You’ve probably got a ton of questions about the platform and the solution we offer, so head over to the FAQ section of the website where you’ll 
            find all the answers that you’re looking for!</p>
            <p>&nbsp;</p>
          </div>
          <div className="gap-4 px-8">
            <img className="" src="/images/HPBnew-logo-1-360x170.png"/>
            <div className="flex justify-center">
              <img className="mt-5" src="/images/blockchain-image-360x300.jpeg"/>
            </div>
            <div className="flex justify-center">
              <img className="mt-5" src="/images/face-off-360x300.jpg" />
            </div>
            <div className="flex justify-center">
              <img className="mt-5" src="/images/esportsref-logo-v3-260x260.png" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 my-4">
          <div className="gap-4">
            <img className="intro-img" src="/images/make-some-money-450x300.gif"/>
          </div>
          <div className="col-span-2 wpb_wrapper">
            <h1 className="mb-5 text-2xl uppercase yellow-title">Fancy becoming an esportsref Referee, and earning some valuable HPB coin for doing so?</h1>
            <p className="my-4">All you need to do is register to become a referee. Complete our form, and provide some details about yourself, 
            including what games you particularly love and that you’d be happy to watch and referee.</p>
            <p className="my-4">You’ll need a HPB wallet address so that you can be paid your HPB coin. You can earn HPB crypto by watching games 
            and determining the winner!</p>
          </div>
        </div>
        <div>
          <div className='mt-5 text-center'>
            <h1 className="text-2xl yellow-title">Live Twitch Games Playing Now</h1>
          </div>
        </div>
        <div id="DIV_1" className='text-center'>
          <h1 className="text-5xl yellow-title">FEATURED GAME</h1>
        </div>
        <div className="mt-5">
          <h1 className="text-xl font-bold yellow-title">LEAGUE OF LEGENDS</h1>
          <p><img className="size-full post-img alignleft" src="/images/league-of-legends.jpg" alt="post-home-1" width="536" height="395" /></p>
          <p className="my-8">League of Legends is a 2009 multiplayer online battle arena video game developed and published by Riot Games. Inspired by a modified version of Warcraft III called Defense of the Ancients, Riot's founders sought to develop a stand-alone game in the same genre. The game has been free-to-play, and is monetized through purchasable character customization.</p>
          <p className="mt-8">In the game, two teams of five players battle in player versus player combat, with each team occupying and defending their own half of the map. Each of the ten players controls a character, known as a "champion", with unique abilities and differing styles of play. During a match, champions become more powerful by collecting experience points and purchasing items in order to defeat the opposing team. In the game's main mode, Summoner's Rift, a team wins by pushing through to the enemy base and destroying their "nexus", a large structure located within it.</p>
          <blockquote className="my-8">
            <p><img className="size-full post-img alignright" src="/images/League-of-Legends-game-map.png" alt="post-home-2" width="300" height="447" /></p>
            <p>League of Legends receives generally positive reviews, with critics highlighting its accessibility, character designs, and production value. The game's long lifespan has resulted in a critical reappraisal, with reviews trending positively. The player base's negative and abusive in-game behavior, criticized since early in the game's lifetime, persists despite attempts by Riot to fix the problem. In 2019, the game regularly peaked at eight million concurrent players, and its popularity has led to various tie-ins, such as music videos, comic books, short stories, and an upcoming animated series. The game's success has also spawned several spin-off video games, including a mobile version and a digital collectible card game. A massively multiplayer online role-playing game is in development.</p>
            <p className="my-2">League of Legends is often cited as the world's largest e-sports game, with an international competitive scene composed of 13 leagues. The 2019 League of Legends World Championship had over 100 million unique viewers, peaking at a concurrent viewership of 44 million, with a minimum prize pool of US$2.5 million. The North American league is broadcast on cable television sports channel ESPN.</p>
          </blockquote>
        </div>
        <div className='text-center'>
          <h1 className="my-8 text-4xl yellow-title">TOP PLAYERS FROM THE LEADERBOARD</h1>
        </div>
        <div className="flex justify-center">
          <figure>
            <img width="816" height="621" src="/images/top-players.png" className="vc_single_image-img attachment-full" alt="" />
          </figure>
        </div>
        <div className='text-center'>
          <h1 className="my-5 text-4xl yellow-title">WHAT IS HPB CRYPTO?</h1>
        </div>
        <div className="grid grid-cols-3">
          <div className="col-span-2">
            <p>High Performance Blockchain (HPB) is a revolutionary permission-less blockchain architecture that combines HPB’s customized hardware Blockchain Offload Engine (BOE), with high-performance blockchain software, enabling unrivaled scalability.</p>
            <p className="mt-5">HPB utilizes dedicated high specification servers and the BOE hardware units. These chipsets are designed to increase security, and accelerate the rate at which transactions are processed by reducing bottlenecks in the server. The BOE includes a unique&nbsp;Hardware Random Number Generator (HRNG) which ensures that data structures are fully randomized.</p>
            <p className="mt-5">Our site uses the HPB cryptocurrency, HPB smart contracts, and the HPB Hardware Random Number Generator (HRNG) to deliver the worlds first truly impartial e-sports online exchange betting solution!</p>
          </div>
          <div>
            <figure>
              <div>
                <img className="vc_single_image-img " src="/images/HBP-logo2.png" width="318" height="148" alt="HBP logo2" title="HBP logo2" />
              </div>
            </figure>
            <figure className="mt-5">
              <div>
                <img className="vc_single_image-img " src="/images/HPBkucoin-1.png" width="318" height="118" alt="HPBkucoin" title="HPBkucoin" />
              </div>
            </figure>
          </div>
        </div>
        <div className='text-center'>
          <h1 className="mt-5 text-2xl yellow-title">READ MORE ABOUT HPB CRYPTO AND HOW YOU CAN GET SOME!</h1>
        </div>
        <div className='text-center'>
          <h1 className="my-8 text-4xl yellow-title">BECOME AN E-SPORTS REF !!!</h1>
        </div>
        <div className="flex justify-center">
          <div className="youtube-wrapper">
            <iframe width="1170" height="658" src="https://www.youtube.com/embed/zY1vLEk8B9c?feature=oembed" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen="" />
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-11/12 mt-5">
            <div className="vc_progress-bar">
              <small className="vc_label">E-Sports Referees Online - ready to referee games! 
                <span className="vc_label_units"> 7329#</span>
              </small>
              <span className="bg-green-500 vc_bar" data-percentage-value="100" data-value="7329" style={{ width: '100%' }}></span>
            </div>
            <div className="mt-3 vc_progress-bar">
              <small className="vc_label">Games Refereed today 
                <span className="vc_label_units"> 5290#</span>
              </small>
              <span className="bg-red-500 vc_bar" data-percentage-value="100" data-value="7329" style={{ width: '72.17%' }}></span>
            </div>
            <div className="mt-3 vc_progress-bar">
              <small className="vc_label">Marketing 
                <span className="vc_label_units"> 70#</span>
              </small>
              <span className="bg-blue-500 vc_bar" data-percentage-value="100" data-value="7329" style={{ width: '0.9551%' }}></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IndexPage;
