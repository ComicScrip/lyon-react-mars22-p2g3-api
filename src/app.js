const express = require('express');
const cors = require('cors');
const db = require('./db');
const Joi = require('joi');
const app = express();
app.use(express.json());
app.use(cors());

// FAIRE AFFICHER TOUS LES PRODUITS
app.get('/quotes', async (req, res) => {
  try {
    const [quotes] = await db.promise().query('SELECT * FROM quotes');
    res.send(quotes);
  } catch (err) {
    console.error(err);
    res.status(500).send('something wrong happened');
  }
});

// AJOUTER UN PRODUIT AVEC POST
app.post('/quotes', async (req, res) => {
  try {
    const { name, comment } = req.body;
    const { error: validationErrors } = Joi.object({
      name: Joi.string().max(50).required(),
      comment: Joi.string().min(0).required(),
    }).validate({ name, comment }, { abortEarly: false });

    if (validationErrors) {
      return res.status(422).json({ errors: validationErrors.details });
    }
    const [{ insertId }] = await db
      .promise()
      .query('INSERT INTO quotes (name, comment) VALUES (?, ?)', [
        name,
        comment,
      ]);

    res.status(201).send({ id: insertId, name, comment });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.delete('/quotes/:id', async (req, res) => {
  try {
    const [{ quoteId }] = await db
      .promise()
      .query('DELETE FROM movies WHERE id = ?', [req.params.id]);

    if (quoteId !== 0) res.sendStatus(204);
    else res.sendStatus(404);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

db.connect((err) => {
  if (err) console.error('error connecting to db');
});
module.exports.app = app;
