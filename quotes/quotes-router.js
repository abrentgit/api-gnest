const express = require('express');
const router = express.Router();
const { Quote } = require('../models');

router.get('/', (req, res) => {
  const perPage = 3;
  const currentPage = req.query.page || 1;

  Quote.find()
    .skip(perPage * currentPage - perPage)
    .limit(perPage)
    .then(quotes => {
      res.json({
        quotes: quotes.map(quote => quote.serialize())
      });
    })
    .catch(err => {
      res.status(500).json({
        message: 'Internal server error'
      });
    });
});

// GET quotes BY ID

router.get('/:id', (req, res) => {
  Quote.findById(req.params.id)
    .then(quote => res.json(quote.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'Something went horribly wrong'
      });
    });
});

router.post('/', (req, res) => {
  const requiredFields = ['author', 'content'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Quote.create({
    author: req.body.author,
    content: req.body.content
  })
    .then(quote => res.status(201).json(quote.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'Something went wrong'
      });
    });
});

module.exports = router;
