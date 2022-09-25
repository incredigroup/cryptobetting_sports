import { nanoid } from 'nanoid';

export async function getAllGames(db) {
  return db
    .collection('games')
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getGames(db, userId) {
  return db
    .collection('games')
    .find({
      $or: [
        { creatorId: userId },
        { player2: userId },
      ]
    })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findGameById(db, gameId) {
  return db.collection('games').findOne({
    _id: gameId,
  }).then((game) => game || null);
}

export async function findGameByCreatorId(db, creatorId) {
  const lastGame = await db.collection('games').find({ creatorId }).sort({ createdAt: -1 }).limit(1).toArray();
  return lastGame[0];
}

export async function findGameByTokenContractAddress(db, tokenContractAddress) {
  return db.collection('games').findOne({
    tokenContractAddress
  }).then((game) => game || null);
}

export async function createGame(db, { status, creatorId, tokenType, tokenContractAddress }) {
  db.collection('games').insertOne({
    _id: nanoid(12),
    status,
    creatorId,
    tokenType,
    tokenContractAddress,
    createdAt: new Date(),
  }).then(({ ops }) => ops[0]);
}

export async function updateGameById(db, id, update) {
  return db.collection('games').findOneAndUpdate(
    { _id: id },
    { $set: update },
    { returnOriginal: false },
  ).then(({ value }) => value);
}
