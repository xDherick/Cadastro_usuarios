// src/server.js
require('dotenv').config();
const app = require('./app');
const { verifyMailConnection } = require('./services/mail.service');

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  await verifyMailConnection();
});
