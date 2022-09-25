import pkg from 'mongodb';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

const { MongoClient } = pkg;
dotenv.config();
let dbHandle;
let dbClient;
let indexesCreated = false;

async function createIndexes(db) {
  await Promise.all([
    db
      .collection('tokens')
      .createIndex({ expireAt: -1 }, { expireAfterSeconds: 0 }),
    db.collection('users').createIndex({ email: 1 }, { unique: true }),
  ]);
  indexesCreated = true;
}

async function connectDB() {
  if (!dbClient) {
    dbClient = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    try {
      console.log('Trying to connect...', process.env.MONGODB_URI);
      await dbClient.connect();
    } catch (error) {
      console.log('err:', error);
    }
  }
  dbHandle = dbClient.db(process.env.DB_NAME);
  if (!indexesCreated) await createIndexes(dbHandle);
}

async function seedUsers() {
  const userData = [{
    email: 'player1@esrdemo.com',
    password: 'player1',
    name: 'player1',
    user_type: 'player',
    telephone: '12345678910',
    hpbwallet: '0xa85c93f37263099c6e04c97691de8bf8761994d1',
  },{
    email: 'player2@esrdemo.com',
    password: 'player2',
    name: 'player2',
    user_type: 'player',
    telephone: '12345678911',
    hpbwallet: '0xa87cd79f4e83052b929b647a27857d043601b4af',
  },{
    email: 'player3@esrdemo.com',
    password: 'player3',
    name: 'player3',
    user_type: 'player',
    telephone: '12345678912',
    hpbwallet: '0xa88dca9e9c079c5dcf8dd8e7cb2ae28bd7a7e069',
  },{
    email: 'player4@esrdemo.com',
    password: 'player4',
    name: 'player4',
    user_type: 'player',
    telephone: '12345678913',
    hpbwallet: '0xa8a6c1b35638938f9124f18aa1aa5404940395bd',
  },{
    email: 'referee1@esrdemo.com',
    password: 'referee1',
    name: 'referee1',
    user_type: 'referee',
    telephone: '12345678914',
    hpbwallet: '0xa8ae80c81bcfe61800ca313ad9995c5f9265fd36',
  },{
    email: 'referee2@esrdemo.com',
    password: 'referee2',
    name: 'referee2',
    user_type: 'referee',
    telephone: '12345678915',
    hpbwallet: '0xa8cb8a549aeacc2de29ec2b7dcb10debfedddeda',
  },{
    email: 'referee3@esrdemo.com',
    password: 'referee3',
    name: 'referee3',
    user_type: 'referee',
    telephone: '12345678916',
    hpbwallet: '0xa8d55b61b067ee983aeb487269c558daeb7846b0',
  },];
  userData.forEach(async function (user) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    console.log('adding user:', user.email);
    dbHandle.collection('users').insertOne({
      _id: nanoid(12),
      emailVerified: false,
      available: true,
      profilePicture: null,
      email: user.email,
      password: hashedPassword,
      name: user.name,
      hpbwallet: user.hpbwallet,
      user_type: user.user_type,
      telephone: user.telephone,
    });
  });
}

function seedGames() {
  /*
  players: 9x_slb8z7KM_, S-6TmtRHKLpO, 5n35LyCWc-ZG, tn5mEjpbVAXa
  referee: uFfUdi1ZYWtI, 2h3MDyVjuXTP, vaDHMH32Kit-
  */
  const gameData = [
    {
    _id: nanoid(16),
    creatorId: '9x_slb8z7KM_',
    player2: 'S-6TmtRHKLpO',
    name: 'League of Legend Round 1',
    competeFor: 'HPB',
    referee: 'uFfUdi1ZYWtI',
    mediator: '',
    stakeAmount: 100,
    p1: '',
    p2: '',
    ref: '',
    winnerDeclared: true,
    winner: '9x_slb8z7KM_',
    drawDeclared: false,
    disputed: false,
    contractAddr: '0x7626761D680806699b1CF63e8447488f02955316',
    winnerReward: 95,
    refReward: 3,
    mediatorReward: '',
    status: 'finished',
  },{
    _id: nanoid(16),
    creatorId: 'S-6TmtRHKLpO',
    player2: '5n35LyCWc-ZG',
    name: 'Counter Strike',
    competeFor: 'HPB',
    referee: '2h3MDyVjuXTP',
    mediator: '',
    stakeAmount: '200',
    p1: '',
    p2: '',
    ref: '',
    winnerDeclared: true,
    winner: '5n35LyCWc-ZG',
    drawDeclared: false,
    disputed: false,
    contractAddr: '0x7626761D680806699b1CF63e8447488f02955316',
    winnerReward: 190,
    refReward: 6,
    mediatorReward: '',
    status: 'finished',
  },{
    _id: nanoid(16),
    creatorId: 'tn5mEjpbVAXa',
    player2: 'S-6TmtRHKLpO',
    name: 'Rust-1',
    competeFor: 'ESR',
    referee: 'uFfUdi1ZYWtI',
    mediator: '',
    stakeAmount: 100,
    p1: '',
    p2: '',
    ref: '',
    winnerDeclared: true,
    winner: 'tn5mEjpbVAXa',
    drawDeclared: false,
    disputed: false,
    contractAddr: '0x7626761D680806699b1CF63e8447488f02955316',
    winnerReward: 95,
    refReward: 3,
    mediatorReward: '',
    status: 'finished',
  },{
    _id: nanoid(16),
    creatorId: '5n35LyCWc-ZG',
    player2: '9x_slb8z7KM_',
    name: 'FIFA 21',
    competeFor: 'HPB',
    referee: 'vaDHMH32Kit-',
    mediator: '',
    stakeAmount: 300,
    p1: '',
    p2: '',
    ref: '',
    winnerDeclared: true,
    winner: '9x_slb8z7KM_',
    drawDeclared: false,
    disputed: false,
    contractAddr: '0x7626761D680806699b1CF63e8447488f02955316',
    winnerReward: 285,
    refReward: 9,
    mediatorReward: '',
    status: 'finished',
  },{
    _id: nanoid(16),
    creatorId: '9x_slb8z7KM_',
    player2: 'tn5mEjpbVAXa',
    name: 'NBA1',
    competeFor: 'HPB',
    referee: '2h3MDyVjuXTP',
    mediator: '',
    stakeAmount: 200,
    p1: '',
    p2: '',
    ref: '',
    winnerDeclared: true,
    winner: 'tn5mEjpbVAXa',
    drawDeclared: false,
    disputed: false,
    contractAddr: '0x7626761D680806699b1CF63e8447488f02955316',
    winnerReward: 190,
    refReward: 6,
    mediatorReward: '',
    status: 'finished',
  },{
    _id: nanoid(16),
    creatorId: '5n35LyCWc-ZG',
    player2: 'S-6TmtRHKLpO',
    name: 'Dota',
    competeFor: 'HPB',
    referee: 'uFfUdi1ZYWtI',
    mediator: '',
    stakeAmount: 100,
    p1: '',
    p2: '',
    ref: '',
    winnerDeclared: false,
    winner: '',
    drawDeclared: true,
    disputed: true,
    contractAddr: '0x7626761D680806699b1CF63e8447488f02955316',
    winnerReward: '',
    refReward: 6,
    mediatorReward: '',
    status: 'finished',
  },{
    _id: nanoid(16),
    creatorId: '5n35LyCWc-ZG',
    player2: 'S-6TmtRHKLpO',
    name: 'FIFA-21',
    competeFor: 'ESR',
    referee: 'vaDHMH32Kit-',
    mediator: '',
    stakeAmount: 100,
    p1: '',
    p2: '',
    ref: '',
    winnerDeclared: true,
    winner: 'S-6TmtRHKLpO',
    drawDeclared: false,
    disputed: false,
    contractAddr: '0x7626761D680806699b1CF63e8447488f02955316',
    winnerReward: 95,
    refReward: 3,
    mediatorReward: '',
    status: 'finished',
  },{
    _id: nanoid(16),
    creatorId: 'tn5mEjpbVAXa',
    player2: '9x_slb8z7KM_',
    name: 'Call of duty',
    competeFor: 'HPB',
    referee: 'vaDHMH32Kit-',
    mediator: '',
    stakeAmount: 100,
    p1: '',
    p2: '',
    ref: '',
    winnerDeclared: true,
    winner: '9x_slb8z7KM_',
    drawDeclared: false,
    disputed: true,
    contractAddr: '0x7626761D680806699b1CF63e8447488f02955316',
    winnerReward: 95,
    refReward: 3,
    mediatorReward: '',
    status: 'finished',
  },];
  // gameData.forEach(function (game){
  //   dbHandle.collection('games').insertOne(game);
  // });
  return Promise.all(gameData.map( game => dbHandle.collection('games').insertOne(game) ))
  .then( res => {
    console.log('Game Data Seed: Done');
    return true;
  });
}

async function seed() {
  await connectDB();

  // dbHandle.collectionNames(function (err, collections) {
  //   console.log('collections', collections);
  // });

  // seedUsers();
  const ret = await seedGames();

  if (ret) {
    process.exit();
  }
}

// Seed database
seed();
