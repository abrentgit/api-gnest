const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const { CLIENT_ORIGIN, DATABASE_URL, PORT } = require('./config');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// import by naming router as userts router
const { router: usersRouter } = require('./users/router');

// morgan
app.use(morgan('common'));

// CORS

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// REGISTER USER

app.use('/api/users/', usersRouter);

// MOCK ENDPOINT

app.get('/api/*', (req, res) => {
  res.json({ ok: true });
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
