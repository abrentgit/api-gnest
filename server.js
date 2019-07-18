const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');

const router = express.Router();
const { User } = require('./models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('./config');
const bodyParser = require('body-parser');

// const passport = require('passport');

const { CLIENT_ORIGIN, DATABASE_URL, PORT } = require('./config');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// import by naming router as userts router
const { router: usersRouter } = require('./users/router');

// import and rename router to auth router
// const { router: authRouter } = require('./auth/router');
// const { jwtStrategy, localStrategy } = require('./auth/strategies');

// morgan
app.use(morgan('common'));

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

const createAuthToken = function(user) {
  return jwt.sign({ user }, config.JWT_SECRET, {
    subject: user.email,
    audience: user.role,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

app.use(bodyParser.json());

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

// CORS
// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//   res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
//   if (req.method === 'OPTIONS') {
//     return res.send(204);
//   }
//   next();
// });

// REGISTER + LOGIN USER

app.use('/api/users/', usersRouter);
// app.use('/api/auth/', authRouter);

// // PASSPORT MODULES
// passport.use(localStrategy);
// passport.use(jwtStrategy);

// const jwtAuth = passport.authenticate('jwt', { session: false });

// app.get('/api/protected', jwtAuth, (req, res) => {
//   return res.json({
//     data: 'rosebud'
//   });
// });

// app.use('*', (req, res) => {
//   return res.status(404).json({ message: 'Not Found' });
// });

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
