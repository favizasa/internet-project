const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a tu PostgreSQL local
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pachanet_db',
  password: '1234', 
  port: 5432,
});

// Endpoint para traer los planes a la interfaz web
app.get('/api/plans', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plans WHERE is_active = true');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor de base de datos');
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor de PACHANET corriendo en puerto ${PORT}`));