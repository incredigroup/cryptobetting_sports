import nc from 'next-connect';
import { all } from '@/middlewares/index';

const handler = nc();

handler.use(all);

handler.get((req, res) => {
  if (!req.user) return res.json({ user: null });
  const { password, ...u } = req.user;
  res.json({ user: u });
});

export default handler;
