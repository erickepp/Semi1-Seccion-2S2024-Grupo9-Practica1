const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const userRoutes = require('../user/usuario'); 
const songRoutes = require('../songs/song');
const autenticacion = require('../user/autenticacion');
const listaReproduccion = require('../songs/playList');
const favoritos = require('../songs/favoritos');
const playListCanciones = require('../songs/playlistCanciones');

const app = express();
const port = 3000;

// Configurar CORS
app.use(cors());

// Parsear el JSON
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Usar las rutas de usuario
app.use('/', userRoutes);
app.use('/', songRoutes);
app.use('/', autenticacion);
app.use('/', listaReproduccion);
app.use('/', favoritos);
app.use('/', playListCanciones);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
