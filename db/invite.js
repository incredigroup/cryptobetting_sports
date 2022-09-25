import { nanoid } from 'nanoid';

export async function getInvitesForPlayer(db, to) {
  return db
    .collection('invites')
    .find({
      // Pagination: Fetch posts from before the input date or fetch from newest
      ...({ status: 'created' }),
      ...(to && { player2: to }),
    })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getInvitesForReferee(db, to) {
  return db
    .collection('invites')
    .find({
      // Pagination: Fetch posts from before the input date or fetch from newest
      ...({ status: 'accepted' }),
      ...(to && { referee: to }),
    })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getInviteById(db, inviteId, gameId) {
  const res = await db.collection('invites').findOne({
      // Pagination: Fetch posts from before the input date or fetch from newest
      _id: inviteId,
      status: 'referee_accepted',
      gameId: gameId
    }).then(invite => invite || null);

    return res;
}

export async function createInvite(db, inviteData) {
  return db.collection('invites').insertOne({
    _id: nanoid(12),
    createdAt: new Date(),
    ...inviteData
  }).then(({ ops }) => ops[0]);
}

export async function updateInviteById(db, id, update) {
  return db.collection('invites').findOneAndUpdate(
    { _id: id },
    { $set: update },
    { returnOriginal: false },
  ).then(({ value }) => value);
}

export async function deleteInviteById(db, id, update) {
  return db.collection('invites').findOneAndDelete(
    { _id: id }
  ).then(({ value }) => value);
}