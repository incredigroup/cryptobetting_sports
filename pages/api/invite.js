import nc from 'next-connect';
import { all } from '@/middlewares/index';
import { getInviteById } from '@/db/index';

const handler = nc();
handler.use(all);

handler.get(async (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  } else {
    const { id:inviteId, gameId } = req.query;
    if (inviteId && gameId) {
      const invite = await getInviteById(req.db, inviteId, gameId);
      return res.json({ invite });
    } else {
      return res.json({});
    }
  }
});

export default handler;
