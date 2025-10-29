const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authenticate = require('../middleware/authenticateJWT');

router.get('/', authenticate, async (req,res) => {
  res.json(await Product.find().sort({createdAt:-1}));
});

router.post('/', authenticate, async (req,res) => {
  if (req.user.role !== 'admin') return res.status(403).json({error:'Solo admin'});
  const producto = new Product(req.body);
  await producto.save();
  res.status(201).json(producto);
});

router.put('/:id', authenticate, async (req,res) => {
  if (req.user.role !== 'admin') return res.status(403).json({error:'Solo admin'});
  const actualizado = await Product.findByIdAndUpdate(req.params.id, req.body, {new:true});
  if (!actualizado) return res.status(404).json({error:'No encontrado'});
  res.json(actualizado);
});

router.delete('/:id', authenticate, async (req,res) => {
  if (req.user.role !== 'admin') return res.status(403).json({error:'Solo admin'});
  await Product.findByIdAndDelete(req.params.id);
  res.json({msg:'Eliminado'});
});
module.exports = router;
