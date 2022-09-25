import nc from 'next-connect';
import { all } from '@/middlewares/index';
import passport from '@/middlewares/passport';
import { extractUser } from '@/lib/api-helpers';
import { updateUserById } from '@/db/index';

const handler = nc();

handler.use(all);

handler.post(passport.authenticate('local'), async (req, res) => {
  await updateUserById(req.db, req.user._id, {
    ...({ available: true }),
  });

  res.json({ user: extractUser(req.user) });
});

handler.delete(async (req, res) => {
  req.logOut();
  await updateUserById(req.db, req.user._id, {
    ...({ available: false }),
  });
  res.status(204).end();
});

export default handler;
