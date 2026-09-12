require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const planesRoutes = require('./routes/planes');
const solicitudesRoutes = require('./routes/solicitudes');
const ticketsRoutes = require('./routes/tickets');
const kpiRoutes = require('./routes/kpi');
const mapaRoutes = require('./routes/mapa');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/planes', planesRoutes);
app.use('/api/solicitudes', solicitudesRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/mapa', mapaRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API WISP Pachacútec corriendo en http://localhost:${PORT}`);
});