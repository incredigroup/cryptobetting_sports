import nc from 'next-connect';
import { all } from '@/middlewares/index';
import { updateUserById } from '@/db/index';
import { extractUser } from '@/lib/api-helpers';
import bcrypt from 'bcryptjs';

const handler = nc();
handler.use(all);

handler.put(async (req, res) => {
  if (!req.user) {
    req.status(401).end();
    return;
  }
  
  const { avatar } = req.body;

  const user = await updateUserById(req.db, req.user._id, {
    ...(avatar && { avatar }),
  });

  res.json({ user: extractUser(user) });
});

handler.patch(async (req, res) => {
  if (!req.user) {
    req.status(401).end();
    return;
  }

  const { name, email, password, isOnline, twitch, facebook, youtube, xbox, psn, nintendo, steam, epic, google, twitter, instagram, telegram, wechat, reddit } = req.body;

  const data = {
    ...(name && { name }),
    ...(email && { email }),
    ...(password && { password: await bcrypt.hash(password, 10) }),
    ...(isOnline !== undefined && { isOnline }),
    ...(twitch && { "othernames.twitch": twitch }),
    ...(facebook && { "othernames.facebook": facebook }),
    ...(youtube && { "othernames.youtube": youtube }),
    ...(xbox && { "othernames.xbox": xbox }),
    ...(psn && { "othernames.psn": psn }),
    ...(nintendo && { "othernames.nintendo": nintendo }),
    ...(steam && { "othernames.steam": steam }),
    ...(epic && { "othernames.epic": epic }),
    ...(google && { "othernames.google": google }),
    ...(twitter && { "othernames.twitter": twitter }),
    ...(instagram && { "othernames.instagram": instagram }),
    ...(telegram && { "othernames.telegram": telegram }),
    ...(wechat && { "othernames.wechat": wechat }),
    ...(reddit && { "othernames.reddit": reddit }),
  }
console.log(33, data)
  const user = await updateUserById(req.db, req.user._id, data);

  res.json({ user: extractUser(user) });
});

export default handler;
