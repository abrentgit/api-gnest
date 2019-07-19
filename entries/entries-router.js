const express = require('express');
const router = express.Router();
const { Entry, User } = require('../models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// GET ENTRY - good

router.get('/', (req, res) => {
  const perPage = 3;
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

// POST ENTRIES

router.post('/', jsonParser, (req, res) => {
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
      Entry.create({
        title: req.body.title,
        date: req.body.date,
        content: req.body.content
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

// router.get('/:id', (req, res) => {
//   Entry.findById(req.params.id)
//     .then(entry => res.json(entry.serialize()))
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({
//         error: 'Something went horribly wrong'
//       });
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

module.exports = router;
