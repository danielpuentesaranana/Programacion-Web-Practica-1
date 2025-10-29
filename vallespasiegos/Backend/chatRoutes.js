const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authenticate = require('../middleware/authenticateJWT');

router.get('/', authenticate, async (req, res) => {
  const mensajes = await Message.find().sort({fecha: -1}).limit(40);
  res.json(mensajes.reverse());
});

module.exports = router;
