// 'use strict';
// const { Strategy: LocalStrategy } = require('passport-local');

// const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

// const { User } = require('../models');
// const { JWT_SECRET } = require('../config');

// const localStrategy = new LocalStrategy((email, password, callback) => {
//   let user;
//   User.findOne({ email: req.body.email })
//     .then(_user => {
//       user = _user;
//       if (!user) {
//         console.log('error', err);
//         console.log('user', 'this is user');
//         console.log(email);
//         // Return a rejected promise so we break out of the chain of .thens.
//         // Any errors like this will be handled in the catch block.
//         return Promise.reject({
//           reason: 'LoginError',
//           message: 'Incorrect email or password'
//         });
//       }
//       return user.validatePassword(password);
//     })
//     .then(isValid => {
//       if (!isValid) {
//         return Promise.reject({
//           reason: 'LoginError',
//           message: 'Incorrect email or password'
//         });
//       }
//       return callback(null, user);
//     })
//     .catch(err => {
//       if (err.reason === 'LoginError') {
//         return callback(null, false, err);
//       }
//       return callback(err, false);
//     });
// });

// const jwtStrategy = new JwtStrategy(
//   {
//     secretOrKey: JWT_SECRET,
//     // Look for the JWT as a Bearer auth header
//     jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
//     // Only allow HS256 tokens - the same as the ones we issue
//     algorithms: ['HS256']
//   },
//   (payload, done) => {
//     done(null, payload.user);
//   }
// );

// module.exports = { localStrategy, jwtStrategy };
