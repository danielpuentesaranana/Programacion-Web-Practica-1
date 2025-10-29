const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {cors:{origin:'*'}});
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const MONGO_URL = process.env.MONGOURI || 'mongodb://localhost:27017/valles';
mongoose.connect(MONGO_URL);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/productos', require('./routes/productRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

app.use(express.static(path.join(__dirname, '../../frontend/public')));
app.get('/', (req,res) =>
  res.sendFile(path.join(__dirname, '../../frontend/public/index.html'))
);

const Message = require('./models/Message');
io.on('connection', (socket) => {
  socket.on('chat message', async ({user, texto}) => {
    const msg = new Message({user, texto});
    await msg.save();
    io.emit('chat message', {user, texto, fecha: msg.fecha});
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({error: err.message});
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, ()=>console.log('Servidor activo en http://localhost:'+PORT));
