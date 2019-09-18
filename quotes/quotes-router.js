const express = require('express');
const router = express.Router();
const { Quote } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config');

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
        // console.log(decoded, 'this is token');
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

router.get('/', verifyUser, (req, res) => {
  const perPage = 1;
  const currentPage = req.query.page || 1;

  Quote.find()
    .skip(perPage * currentPage - perPage)
    .limit(perPage)
    .then(quotes => {
      console.log(quotes);
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

router.get('/:id', verifyUser, (req, res) => {
  Quote.findById(req.params.id)
    .then(quote => res.json(quote.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({
        error: 'Something went horribly wrong'
      });
    });
});

router.post('/', verifyUser, (req, res) => {
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
