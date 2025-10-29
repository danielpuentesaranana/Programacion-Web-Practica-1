module.exports = {
  mongoURL: process.env.MONGOURI || 'mongodb://localhost:27017/valles',
  jwtSecret: process.env.JWT_SECRET || 'secreto-valles'
};
