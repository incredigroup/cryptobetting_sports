import nc from 'next-connect';
import { all } from '@/middlewares/index';
import { createGame, updateGameById, findGameById, getGames } from '@/db/index';
import { extractUser } from '@/lib/api-helpers';
import { sendMail } from '@/lib/mail';

const handler = nc();

handler.use(all);

// get game
handler.get(async (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  } else {
    const id = req.query.id;
    if (id) {
      const game = await findGameById(req.db, id);
      return res.json({ game });
    } else {
      const games = await getGames(req.db, req.user._id)
      return res.json({ games });
    }
  }
});

// create a new game
handler.post(async (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  } else {
    const user = extractUser(req.user);
    const creatorId = user._id;
    const { tokenType, tokenContractAddress } = JSON.parse(req.body);
    
    await createGame(req.db, {
      creatorId, status: 'created', tokenType, tokenContractAddress
    });
    return res.send().ok();
  }
});

// update game
handler.patch(async (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  } else {
    const { gameId, status, stake_amount, loser, disputer, disputeText, tokenContractAddr, referee, refRandomNumber, inviteId } = req.body;

    const gameData = {
      ...(status && { status }),
      ...(req.body.player2 && { player2: req.body.player2 }),
      ...(stake_amount !== undefined && { stake_amount }),
      ...(loser && { loser }),
      ...(disputer && { disputer }),
      ...(disputeText && { disputeText }),
      ...(referee !== undefined && { referee }),
      ...(refRandomNumber !== undefined && { refRandomNumber }),
      ...(inviteId !== undefined && { inviteId }),
      startPoint: Date.now()
    }

    if (disputer && disputeText) {
      const adminMsg = {
        to: process.env.EMAIL_ADMIN,
        from: process.env.EMAIL_FROM,
        subject: 'Check game dispute',
        html: `
          <div>
            <h3>Hello Administator</h3>
            <h4>Player ${disputer} disputed their game.</h4>
            <div>
              <p>${disputeText}</p>
              <a href="${process.env.WEB_URI}/admin/hpb/${tokenContractAddr}" target="_blank" style="border:2px solid rgb(120, 53, 15); padding: 5px 50px; text-decoration:none; order-radius: 5px;">See the chat history</a>
            </div>
            <p>Please press above button to confirm user.</p>
          </div>
          `,
      };
      sendMail(adminMsg);
    }

    const game = await updateGameById(req.db, gameId, gameData);
    return res.json({ game });
  }
});

export default handler;
