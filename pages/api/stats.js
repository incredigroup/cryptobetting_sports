import nc from 'next-connect';
import { all } from '@/middlewares/index';
import { extractUser } from '@/lib/api-helpers';
import { getUsers, getAllGames } from '@/db/index';

const handler = nc();

handler.use(all);

handler.get(async (req, res) => {
  if (!req.user) {
    res.status(401).send('Not authenticated.');
    return;
  }
  const games = await getAllGames(req.db);

  const result = games.reduce( (acc, current) => {
    if (current.status == 'finished') {
      if (!(current.creatorId in acc)) {
        acc[current.creatorId] = {
          created: 0, wins: 0, losses: 0, joined: 0,
          draws: 0, tokenStaked: 0, tokenBalance: 0,
          hpbAwarded: 0, hpbBalance: 0, ranking: -1,
        };
      }
  
      if (!(current.player2 in acc)) {
        acc[current.player2] = {
          created: 0, wins: 0, losses: 0, joined: 0,
          draws: 0, tokenStaked: 0, tokenBalance: 0,
          hpbAwarded: 0, hpbBalance: 0, ranking: -1,
        };
      }
  
      if (!(current.referee in acc)) {
        acc[current.referee] = {
          judged: 0, disputes: 0, tokenStaked: 0, tokenBalance: 0,
          hpbAwarded: 0, hpbBalance: 0
        };
      }

      acc[current.creatorId]['created'] += 1;
      acc[current.referee]['judged'] += 1;
      acc[current.player2]['joined'] += 1;

      if (current.disputed) {
        acc[current.referee]['disputes'] += 1;
      }

      if (current.competeFor == 'HPB') {
        acc[current.referee]['hpbAwarded'] += current.refReward;
      } else {
        acc[current.referee]['tokenStaked'] += current.refReward;
      }

      if (current.winnerDeclared) {
        if (current.winner == current.player2) {
          acc[current.player2]['wins'] += 1;
          acc[current.creatorId]['losses'] += 1;
          if (current.competeFor == 'HPB') {
            acc[current.player2]['hpbAwarded'] += current.winnerReward;
          } else {
            acc[current.player2]['tokenStaked'] += current.winnerReward;
          }
        } else {
          acc[current.player2]['losses'] += 1;
          acc[current.creatorId]['wins'] += 1;
          if (current.competeFor == 'HPB') {
            acc[current.creatorId]['hpbAwarded'] += current.winnerReward;
          } else {
            acc[current.creatorId]['tokenStaked'] += current.winnerReward;
          }
        }
      } else {
        acc[current.player2]['draws'] += 1;
        acc[current.creatorId]['draws'] += 1;
      }
    }

    return acc;
  }, {});

  res.json({result});
});

export default handler;
