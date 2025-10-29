const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-valles';

router.post('/register', async (req, res) => {
  const {username, password, role} = req.body;
  const exist = await User.findOne({username});
  if (exist) return res.status(400).json({error:'Usuario ya existe'});
  const hash = await bcrypt.hash(password, 10);
  const user = new User({username, password: hash, role});
  await user.save();
  res.json({msg:'Registrado'});
});

router.post('/login', async (req, res) => {
  const {username, password} = req.body;
  const user = await User.findOne({username});
  if (!user) return res.status(400).json({error:'No usuario'});
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({error:'Contraseña incorrecta'});
  const token = jwt.sign({id:user._id, username:user.username, role:user.role},
                         JWT_SECRET, {expiresIn:'3h'});
  res.json({token, user:{username:user.username,role:user.role}});
});
module.exports = router;
