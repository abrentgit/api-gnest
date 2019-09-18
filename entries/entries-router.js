const express = require('express');
const router = express.Router();
const { Entry, User } = require('../models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const config = require('../config');
const jwt = require('jsonwebtoken');

const verifyUser = function(req, res, next) {
  if (!req.headers.authorization) {
    res.status(401).json({
      message: 'Invalid credentials'
    });
    return;
  }

  const tokenSplit = req.headers.authorization.split(' ');
  const token = tokenSplit[1];

  if (token) {
    jwt.verify(token, config.JWT_SECRET, function(error, decoded) {
      if (!error) {
        req.decoded = decoded;

        if (req.decoded.aud === 'User') {
          next();
        } else {
          res.status(401).json({
            message: 'Invalid credentials'
          });
        }
      } else {
        res.status(401).json({
          message: 'Invalid credentials'
        });
      }
    });
  }
};

// GET ENTRY - good

router.get('/', verifyUser, (req, res) => {
  const perPage = 10;
  const currentPage = req.query.page || 1;

  Entry.find()
    .skip(perPage * currentPage - perPage)
    .limit(perPage)
    .then(entries => {
      res.json({
        entries: entries.map(entry => entry.serialize())
      });
    })
    .catch(err => {
      res.status(500).json({
        message: 'Internal server error'
      });
    });
});

// POST ENTRIES - WORKS

router.post('/', verifyUser, jsonParser, (req, res) => {
  const requiredFields = ['user', 'title', 'date', 'content'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  const userId = req.body.user;

  User.findById(userId, (err, user) => {
    if (err) {
      res.status(422).send({
        message: 'Can not find user'
      });
    } else {
      const userId = req.body.user;

      Entry.create({
        title: req.body.title,
        date: req.body.date,
        content: req.body.content,
        user: userId
      })
        .then(order => res.status(201).json(order.serialize()))
        .catch(err => {
          console.error(err);
          res.status(500).json({
            error: 'Something went wrong'
          });
        });
    }
  });
});

// DELETE ENTRY

// router.delete('/:id', (req, res) => {
//   Entry.findByIdAndRemove(req.params.id)
//     .then(entry => res.status(204).end())
//     .catch(err =>
//       res.status(500).json({
//         message: 'Internal server error'
//       })
//     );
// });

// GET ENTRY BY ID - good

// router.get('/:id', verifyUser, (req, res) => {
//   Entry.findById(req.params.id)
//     .then(entry => res.json(entry.serialize()))
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({
//         error: 'Something went horribly wrong'
//       });
//     });
// });

// GET ENTRIES BY USER ID
// find then map the entries into invidivdual entries
// then if the single entry has user ID then return
// router.get('/:userid', verifyUser, (req, res) => {
//   Entry.find({ user: req.params.id }).exec(function(err, entries) {
//     if (err) {
//       console.log('entries');
//       res.status({ message: 'entries not found' });
//     } else {
//       res.json(entries);
//     }
//   });
// });

// jacking this......

router.get('/entries/:user', function(req, res) {
  Entry.find()
    .sort('date')
    .then(function(entries) {
      let entryOutput = []; // created empty array
      entries.map(function(entry) {
        // map isolates each entry
        if (entry.user == req.params.user) {
          entryOutput.push(entry);
        }
      });
      res.json({
        entryOutput
      });
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).json({
        message: 'Internal server error'
      });
    });
});

//   })
//     .sort({ user: req.query.user })
//     .exec()
//     .then(entries => {
//       res.status(200).json(entries);
//     })
//     .catch(err => {
//       res.status(500).json({ message: 'Internal Server Error' });
//     });
// });

// // UPDATE ENTRY

// router.put('/:id', (req, res) => {
//   if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
//     res.status(400).json({
//       error: 'Request path id and request body id values must match'
//     });
//   }

//   const updated = {};
//   const updateableFields = ['content'];
//   updateableFields.forEach(field => {
//     if (field in req.body) {
//       updated[field] = req.body[field];
//     }
//   });

//   Entry.findByIdAndUpdate(req.params.id, updated)
//     .then(updatedEntry => res.status(204).end())
//     .catch(err =>
//       res.status(500).json({
//         message: 'Something went wrong'
//       })
//     );
// });

// get all entries by a particular user:id

// get entries, and only the entries that have the user ID

module.exports = router;
