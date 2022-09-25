import nc from 'next-connect';
import { all } from '@/middlewares/index';
import { findGameByCreatorId } from '@/db/index';

const handler = nc();
handler.use(all);

// get game
handler.get(async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  } else {
    const creatorId = req.query.creatorId;
    if (creatorId) {
      const game = await findGameByCreatorId(req.db, creatorId);
      return res.json({ game });
    } else {
      return res.status(401).end();
    }
  }
});

export default handler;
