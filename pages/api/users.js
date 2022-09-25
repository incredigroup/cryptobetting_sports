import nc from 'next-connect';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import isEmail from 'validator/lib/isEmail';
import normalizeEmail from 'validator/lib/normalizeEmail';
import bcrypt from 'bcryptjs';
import { all } from '@/middlewares/index';
import { extractUser } from '@/lib/api-helpers';
import { sendMail } from '@/lib/mail';
import { insertUser, findUserByEmail, getPlayers, insertToken, findLastRefereeId, findUserByName, updateUserById } from '@/db/index';
import { USER_TYPE } from '@/consts/index';
import path from 'path';
import DatauriParser from 'datauri/parser';
const parser = new DatauriParser();

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg'];

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: function(req, file, cb) {
    if (ALLOWED_FORMATS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Not supported file type!'), false);
    }
  }
})

const handler = nc();
handler.use(all);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

const cloudinaryUpload = file => cloudinary.uploader.upload(file);

const formatBufferTo64 = file =>
  parser.format(path.extname(file.originalname).toString(), file.buffer)

handler.get(async (req, res) => {
  if (!req.user) {
    res.status(401).send('Not authenticated.');
    return;
  }
  const users = await getPlayers(req.db);
  res.json({users});
});

handler.post(upload.single('file'), async (req, res) => {
  
  let passportImg = '';
  if (req.file) {
    try {
      const file64 = formatBufferTo64(req.file);
      const uploadResult = await cloudinaryUpload(file64.content);
      passportImg = uploadResult.secure_url;
    } catch (ex) {
      res.status(400).send('File upload error. Please try again.');
      return;
    }
  }

  let { name, fullname, telephone, address, birthday, hpbwallet, password, user_type } = req.body;
  const email = normalizeEmail(req.body.email);
  if (!isEmail(email)) {
    res.status(400).send('The email you entered is invalid.');
    return;
  }
  if (!password || !name) {
    res.status(400).send('Missing field(s)');
    return;
  }
  if (await findUserByEmail(req.db, email)) {
    res.status(403).send('The email has already been used.');
    return;
  }
  if (await findUserByName(req.db, name)) {
    res.status(403).send('The name has already been used.');
    return;
  }
  
  if (user_type === USER_TYPE.REFEREE) {
    let lastRefereeId = await findLastRefereeId(req.db);
    if (!lastRefereeId) {
      name = 'ref-1';
    } else {
      const lastNumber = parseInt(lastRefereeId.split('-').pop()) || 0;
      const newNumber = lastNumber + 1;
      name = 'ref-' + newNumber;
    }
  }

  // send signup verify mail
  const token = await insertToken(req.db, {
    creatorId: email,
    type: 'signup',
    expireAt: new Date(Date.now() + 1000 * 60 * 20),
  });

  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'ESports sign up',
    html: `
      <div>
        <p>Hello, ${name}</p>
        <div>
          <a href="${process.env.WEB_URI}/signup/${token._id}" target="_blank" style="border:2px solid rgb(120, 53, 15); padding: 5px 50px; text-decoration:none; order-radius: 5px;">Sign Up</a>
        </div>
        <p>Please press above button to sign up.</p>
      </div>
      `,
  };
  sendMail(msg);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await insertUser(req.db, {
    email, password: hashedPassword, bio: '', name, fullname, hpbwallet, telephone, user_type, address, birthday, card_image: passportImg, accepted: false
  });
  if (req.user && extractUser(req.user).user_type == 'admin') {
    res.status(201).json({ user });
  } else {
    req.logIn(user, (err) => {
      if (err) throw err;
      res.status(201).json({
        user: extractUser(req.user),
      });
    });
  }

  const adminMsg = {
    to: process.env.EMAIL_ADMIN,
    from: process.env.EMAIL_FROM,
    subject: 'Confirm user age',
    html: `
      <div>
        <h3>Hello Administator</h3>
        <h4>Please ${name}'s age in this card.</h4>
        <p>Allow till ${new Date().getFullYear()-19}.</p>
        <a href="#">
          <img src="${passportImg}" alt="card image" />
        </a>
        <div style="margin-top:10px">
          <a href="${process.env.WEB_URI}/checkuser/${user._id}" target="_blank" style="border:2px solid rgb(120, 53, 15); padding: 5px 50px; text-decoration:none; order-radius: 5px;">Confirm</a>
        </div>
        <p>Please press above button to confirm user.</p>
      </div>
      `,
  };
  sendMail(adminMsg);
});

handler.put(async (req, res) => {
  // sign up mail verify
  const deletedToken = await findAndDeleteTokenByIdAndType(req.db, req.body.token, 'signup');

  if (!deletedToken) {
    res.status(403).send('This link may have been expired.');
    return;
  }
  res.end('ok');
});

handler.patch(async (req, res) => {
  const user = updateUserById(req.db, req.body.userId, { accepted: req.body.accepted });

  if (!user) {
    res.status(403).send("You can't accept this user.");
    return;
  }
  res.end('ok');
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
