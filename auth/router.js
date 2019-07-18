const express = require('express');
const router = express.Router();
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
// const bodyParser = require('body-parser');
// const jsonParser = bodyParser.json();

const createAuthToken = function(user) {
  return jwt.sign({ user }, config.JWT_SECRET, {
    subject: user.email,
    audience: user.role,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

router.post('/login', (req, res) => {
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

module.exports = { router };
