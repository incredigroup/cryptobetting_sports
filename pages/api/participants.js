import nc from 'next-connect';
import { all } from '@/middlewares/index';
import { findUserById } from '@/db/index';

const handler = nc();
handler.use(all);

handler.get(async (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  } else {
    const id = req.query.id;
    if (id) {
      const user = await findUserById(req.db, id);
      return res.json({ user });
    } else {
      return res.json({});
    }
  }
});

export default handler;
