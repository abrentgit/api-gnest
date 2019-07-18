// const express = require('express');
// const router = express.Router();
// const { User } = require('../models');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
// const config = require('../config');
// const bodyParser = require('body-parser');
// const jsonParser = bodyParser.json();

// router.post('/', jsonParser, (req, res) => {
//   const requiredFields = ['name', 'password', 'email'];
//   for (let i = 0; i < requiredFields.length; i++) {
//     const field = requiredFields[i];
//     if (!(field in req.body)) {
//       const message = `Missing \`${field}\` in request body`;
//       console.error(message);
//       return res.status(400).send(message);
//     }
//   }

//   const createAuthToken = function(user) {
//     return jwt.sign({ user }, config.JWT_SECRET, {
//       subject: user.email,
//       audience: user.role,
//       expiresIn: config.JWT_EXPIRY,
//       algorithm: 'HS256'
//     });
//   };

//   let hashed = bcrypt.hashSync(req.body.password, saltRounds);

//   User.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: hashed
//   })
//     .then(user => {
//       const authToken = createAuthToken(user.serialize());
//       res.status(201).json({
//         authToken
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(422).json({
//         message: 'Something went wrong'
//       });
//     });
// });

// module.exports = { router };
