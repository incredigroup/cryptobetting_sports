import nc from 'next-connect';
import { all } from '@/middlewares/index';
import { createInvite, updateInviteById, deleteInviteById, getInvitesForPlayer, getInvitesForReferee, getRefereeById } from '@/db/index';
import { extractUser } from '@/lib/api-helpers';
import { sendMail } from '@/lib/mail';
import { findGameById, findUserById } from '@/db/index';

const handler = nc();
handler.use(all);

handler.get(async (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  } else {
    const { id:inviteId, gameId } = req.query;
    if (inviteId && gameId) {
      const invite = await getRefereeById(req.db, inviteId, refereeId);
      return res.json({ invite });

    } else {
      if (req.user.user_type == 'player') {
        const invites = await getInvitesForPlayer(req.db, req.user._id);
        return res.json({ invites }); 
      }
      if (req.user.user_type == 'referee') {
        const invites = await getInvitesForReferee(req.db, req.user._id);
        return res.json({ invites });
      }
      res.status(401).end();
      return;
    }
  }
});

handler.post(async (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  } else {
    // invite player2
    if (req.body.player2) {
      const { gameId, player2 } = req.body;
      const user = extractUser(req.user);
      const invite = await createInvite(req.db, {
        status: 'created',
        player1: user._id,
        player2,
        gameId,
        creatorName: req.user.name
      });

      // send mail
      const game = await findGameById(req.db, gameId);
      const pl2 = await findUserById(req.db, player2);
      const newUrl = process.env.WEB_URI + '/' + game.tokenType + '/' + game.tokenContractAddress;

      const msg = {
        to: pl2.email,
        from: process.env.EMAIL_FROM,
        subject: 'ESports invitation',
        html: `
          <div>
            <h2>Hello</h2>
            <p>You are invited by ${user.name}</p>
            <div>
              <a href="${newUrl}" target="_blank" style="border:2px solid rgb(120, 53, 15); padding: 5px 50px; text-decoration:none; order-radius: 5px;">${newUrl}</a>
            </div>
            <p>Please press above button to be invited.</p>
          </div>
          `,
      };
      sendMail(msg);

      return res.json({ invite }); 
    }
    // invite referee to join
    if (req.body.referee) {
      const { gameId, referee } = req.body;
      const invite = await createInvite(req.db, {
        status: 'created',
        referee,
        gameId,
      });
      return res.json({ invite }); 
    }
  }
});

handler.patch(async (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  } else {
    const { inviteId, status, referee } = req.body;

    const data = {
      ...(status && { status }),
      ...(referee !== undefined && { referee }),
    };

    const invite = await updateInviteById(req.db, inviteId, data);
    return res.json({ invite });
  }
});

handler.delete(async (req, res) => {
  if (!req.user) {
    return res.status(401).end();
  } else {
    const { inviteId, status, referee } = req.body;

    const data = {
      ...(status && { status }),
      ...(referee && { referee }),
    };
        
    const invite = await deleteInviteById(req.db, inviteId, data);
    return res.json({ invite });
  }
});

export default handler;
