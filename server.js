require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool } = require('./src/db/index');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/patients', require('./src/routes/patients'));
app.use('/api/files',    require('./src/routes/files'));
app.use('/api/genes',    require('./src/routes/genes'));
app.use('/api/report',   require('./src/routes/report'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Auto-migrate on startup
async function initDb() {
  const schemaPath = path.join(__dirname, 'src/db/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('Database schema ready.');
  } catch (err) {
    console.error('DB init error:', err.message);
  } finally {
    client.release();
  }
}

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Luci Gene Dashboard running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
