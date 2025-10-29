const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {cors:{origin:'*'}});
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
const {mongoURL} = require('./config');

mongoose.connect(mongoURL);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/productos', require('./routes/productRoutes'));

// Frontend
app.use(express.static(path.join(__dirname, 'public')));
app.get('/',(req,res)=> res.sendFile(path.join(__dirname,'public/index.html')));

// Socket.IO chat
io.on('connection', (socket) => {
  socket.on('chat message', msg => io.emit('chat message', msg));
});

const PORT = process.env.PORT||3000;
http.listen(PORT,()=>console.log('http://localhost:'+PORT));
