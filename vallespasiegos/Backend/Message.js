const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  texto: { type: String, required: true },
  fecha: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Message', messageSchema);
