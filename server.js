const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const router = express.Router();

const { User } = require('./models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('./config');

const saltRounds = 10;
const bodyParser = require('body-parser');

const { CLIENT_ORIGIN, DATABASE_URL, PORT } = require('./config');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// QUOTES ROUTER
const quotesRouter = require('./quotes/quotes-router');
app.use('/quotes', quotesRouter);

// ENTRIES ROUTER
const entriesRouter = require('./entries/entries-router');
app.use('/entries', entriesRouter);

// morgan
app.use(morgan('common'));
app.use(express.json());
app.use(bodyParser.json());

// CORS
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// TESTING POST ENTRIES NO ROUTER

// app.post('/entries', (req, res) => {
//   const requiredFields = ['user', 'title', 'date', 'content'];
//   for (let i = 0; i < requiredFields.length; i++) {
//     const field = requiredFields[i];
//     if (!(field in req.body)) {
//       const message = `Missing \`${field}\` in request body`;
//       console.error(message);
//       return res.status(400).send(message);
//     }
//   }

//   const userId = req.body.user;

//   User.findById(userId, (err, user) => {
//     if (err) {
//       res.status(422).send({
//         message: 'Can not find user'
//       });
//     } else {
//       Entry.create({
//         title: req.body.title,
//         date: req.body.date,
//         content: req.body.content
//       })
//         .then(order => res.status(201).json(order.serialize()))
//         .catch(err => {
//           console.error(err);
//           res.status(500).json({
//             error: 'Something went wrong'
//           });
//         });
//     }
//   });
// });

// LOGIN AUTH

const createAuthToken = function(user) {
  return jwt.sign({ user }, config.JWT_SECRET, {
    subject: user.email,
    audience: user.role,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

//LOGIN

app.post('/login', (req, res) => {
  User.findOne(
    {
      email: req.body.email
    },
    function(err, user) {
      console.log('error', err);
      console.log('user', user);
      console.log(req.body.email);
      if (err) {
        res.status(401).json({
          error: 'Invalid credentials'
        });
      }

      if (!user) {
        res.status(404).json({
          error: 'Invalid credentials'
        });
      } else {
        let validPassword = bcrypt.compareSync(
          req.body.password,
          user.password
        );

        if (!validPassword) {
          res.status(401).json({
            error: 'Invalid credentials'
          });
        } else {
          const authToken = createAuthToken(user.serialize());
          res.status(200).json({
            authToken,
            user_id: user._id
          });
        }
      }
    }
  );
});

// REGISTER

app.post('/users', (req, res) => {
  const requiredFields = ['name', 'password', 'email'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  const createAuthToken = function(user) {
    return jwt.sign({ user }, config.JWT_SECRET, {
      subject: user.email,
      audience: user.role,
      expiresIn: config.JWT_EXPIRY,
      algorithm: 'HS256'
    });
  };

  let hashed = bcrypt.hashSync(req.body.password, saltRounds);

  User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashed
  })
    .then(user => {
      const authToken = createAuthToken(user.serialize());
      res.status(201).json({
        authToken
      });
    })
    .catch(err => {
      console.log(err);
      res.status(422).json({
        message: 'Something went wrong'
      });
    });
});

let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useNewUrlParser: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };
