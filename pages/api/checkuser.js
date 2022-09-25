import nc from 'next-connect';
import { all } from '@/middlewares/index';
import { updateUserById } from '@/db/index';

const handler = nc();

handler.use(all);

handler.patch(async (req, res) => {
  const user = updateUserById(req.db, req.body.userId, { accepted: req.body.accepted });

  if (!user) {
    res.status(403).send("You can't accept this user.");
    return;
  }
  res.end('ok');
});

export default handler;
