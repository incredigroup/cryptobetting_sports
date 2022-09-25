import { nanoid } from 'nanoid';
import normalizeEmail from 'validator/lib/normalizeEmail';
import { USER_TYPE } from '@/consts/index';

export async function findUserById(db, userId) {
  const res = await db.collection('users').findOne({
    _id: userId,
  }).then((user) => user || null);

  return res;
}

export async function findLastRefereeId(db) {
  return db.collection('users').find({user_type: USER_TYPE.REFEREE}).limit(1).sort({$natural:-1}).toArray().then((users) => users[0]?.name || null)
}

export async function findUserByName(db, name) {
  return db.collection('users').findOne({
    name: name,
  }).then((user) => user || null);
}

export async function findUserByEmail(db, email) {
  email = normalizeEmail(email);
  return db.collection('users').findOne({
    email,
  }).then((user) => user || null);
}

export async function updateUserById(db, id, update) {
  return db.collection('users').findOneAndUpdate(
    { _id: id },
    { $set: update },
    { returnOriginal: false },
  ).then(({ value }) => value);
}

export async function getUsers(db) {
  return db
    .collection('users')
    .find({
      $or: [
        { user_type: 'player' },
        { user_type: 'referee' },
      ]
    })
    .sort({ name: 1 })
    .toArray();
}

export async function getPlayers(db) {
  return db
    .collection('users')
    .find({
      ...({
        user_type: 'player',
      }),
      ...({ available: true }),
    })
    .sort({ name: 1 })
    .toArray();
}

export async function getReferees(db) {
  return db
    .collection('users')
    .find({
      ...({
        user_type: 'referee',
      }),
      ...({ available: true }),
    })
    .sort({ name: 1 })
    .toArray();
}

export async function getOnlineReferees(db) {
  return db
    .collection('users')
    .find({
      ...({
        user_type: 'referee',
        isOnline: true
      }),
      ...({ available: true }),
    })
    .sort({ "$natural": 1 })
    .toArray();
}

export async function insertUser(db, {
  email, password, bio = '', name, fullname, avatar = 'default.png', hpbwallet, telephone, user_type, address, birthday, card_image, accepted, isOnline = true,
}) {
  user_type === USER_TYPE.REFEREE && (avatar = 'referee.png')

  return db
    .collection('users')
    .insertOne({
      _id: nanoid(12),
      emailVerified: false,
      available: true,
      avatar,
      email,
      password,
      name,
      fullname,
      bio,
      hpbwallet,
      user_type,
      telephone,
      address,
      birthday,
      card_image,
      accepted,
      isOnline,
      othernames: {
        twitch: '',
        facebook: '',
        youtube: '',
        xbox: '',
        psn: '',
        nintendo: '',
        steam: '',
        epic: '',
        google: '',
        twitter: '',
        instagram: '',
        telegram: '',
        wechat: '',
        reddit: ''
      }
    })
    .then(({ ops }) => ops[0]);
}
