require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

const Cliente = mongoose.model('Cliente', new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  telefono: String,
  fecha_registro: { type: Date, default: Date.now }
}));

// AGREGAR CLIENTE
app.post('/clientes', async (req, res) => {
    const { nombre, correo, telefono } = req.body;
  
    if (!nombre || !correo) {
      return res.status(400).json({ error: 'Los campos nombre y correo son obligatorios' });
    }
  
    try {
      const existe = await Cliente.findOne({ correo });
      if (existe) {
        return res.status(400).json({ error: 'El correo ya está registrado' });
      }
  
      const cliente = new Cliente({ nombre, correo, telefono });
      await cliente.save();
      res.status(201).json(cliente);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
// OBTENER CLIENTES
app.get('/clientes', async (req, res) => {
    try {
      const clientes = await Cliente.find({});
      
      res.json(clientes);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(500).json({ 
        error: 'Error al obtener clientes',
        detalles: error.message 
      });
    }
  });

// OBTENER DATOS DE CLIENTE ESPECIFICO
app.get('/clientes/:id', async (req, res) => {
    try {
      if (!req.params.id) {
        return res.status(400).json({ error: 'Se requiere el ID del cliente' });
      }
  
      const cliente = await Cliente.findOne({ _id: req.params.id });
      
      if (!cliente) {
        return res.status(404).json({ error: `Cliente con ID ${req.params.id} no encontrado` });
      }
      res.json(cliente);
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Formato de ID inválido' });
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

// EDITAR CLIENTE
app.put('/clientes/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cliente) return res.status(404).json({ error: 'No encontrado' });
    res.json(cliente);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ELIMINAR CLIENTE
app.delete('/clientes/:id', async (req, res) => {
  const cliente = await Cliente.findByIdAndDelete(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'No encontrado' });
  res.json({ mensaje: 'Eliminado exitosamente' });
});

app.listen(3001, () => console.log('Servidor en puerto 3001'));
