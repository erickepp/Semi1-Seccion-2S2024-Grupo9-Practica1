// songRoutes.js
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('../conexion/conexion');
const { s3, bucketName } = require('../server/bucket');
const router = express.Router();

//configuracion de multer para manejar la carga de archivos
const storage = multer.memoryStorage();

//configuracion AWS S3
/*const s3 = new AWS.S3({
    accessKeyId: 'AKIAZI2LIC4SXPO7JJV4',
    secretAccessKey: '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',
    region: 'us-east-2' // Por ejemplo, 'us-east-1'
});*/

//const bucketName = 'tarea2-202011405';
const photoFolder = "Fotos";
const fileFolder = "Canciones";
  
// Middleware para parsear los datos del cuerpo de la solicitud
router.use(bodyParser.urlencoded({ extended: true }));

// Configura multer para manejar la carga de archivos
const upload = multer({ 
    storage: multer.memoryStorage(), // Usa memoria para almacenar archivos en buffer
    limits: { fileSize: 20 * 1024 * 1024 } // Limite de tamaño del archivo (10 MB)
  });

  
// Define las rutas relacionadas con canciones


// Endpoint para obtener todas las canciones
router.get('/songs', async (req, res) => {
  try {
    // Consulta a la base de datos para obtener todas las canciones
    db.query('SELECT * FROM Cancion', (err, results) => {
      if (err) {
        console.error('Error al ejecutar la consulta:', err);
        return res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
      }

      // Mapear los resultados para ajustar el formato del JSON
      const formattedResults = results.map(row => ({
        artist: row.artista, 
        duration: row.duracion, 
        file: row.archivo, 
        name: row.nombre, 
        photo: row.foto, 
        song_id: row.id_cancion 
      }));

      // Devuelve los resultados en formato JSON
      res.status(200).json(formattedResults);
    });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ message: 'Error interno del servidor: ' + error.message });
  }
});


//ENDPOINT PARA BUSCAR UNA CANCION
// Endpoint para buscar una canción por ID
router.get('/songs/:song_id', (req, res) => {
  const songId = req.params.song_id;

  try {
    // Consulta a la base de datos para obtener la canción con el ID especificado
    const query = 'SELECT * FROM Cancion WHERE id_cancion = ?';
    db.query(query, [songId], (err, results) => {
      if (err) {
        console.error('Error interno del servidor:', err);
        return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Canción no encontrada2.' });
      }

      // Convertir los resultados a un formato adecuado
      const song = results[0];
      const formattedSong = {
        artist: song.artista, 
        duration: song.duracion, 
        file: song.archivo, 
        name: song.nombre, 
        photo: song.foto, 
        song_id: song.id_cancion 
      };

      res.status(200).json(formattedSong);
    });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
  }
});



//ENDPOINT PARA AGREAR CACNCIONES
router.post('/songs', upload.fields([{ name: 'photo' }, { name: 'file' }]), async (req, res) => {
  try {
      const { name, duration, artist } = req.body;
      const photo = req.files['photo'][0]; // Accede al archivo de la foto
      const file = req.files['file'][0]; // Accede al archivo de la canción

      // Validar la entrada
      if (!name || !duration || !artist || !photo || !file) {
          return res.status(400).json({ message: 'Todos los campos son necesarios.' });
      }

      // Subir archivos al bucket
      const photoKey = `${photoFolder}/${photo.originalname}`;
      const fileKey = `${fileFolder}/${file.originalname}`;

      const uploadPhotoParams = {
          Bucket: bucketName,
          Key: photoKey,
          Body: photo.buffer, // Archivo en memoria
          ContentType: photo.mimetype // Tipo MIME del archivo
      };

      const uploadFileParams = {
          Bucket: bucketName,
          Key: fileKey,
          Body: file.buffer, // Archivo en memoria
          ContentType: file.mimetype // Tipo MIME del archivo
      };

      // Subir archivos a S3
      const photoData = await s3.upload(uploadPhotoParams).promise();
      const fileData = await s3.upload(uploadFileParams).promise();

      // Crear y agregar la nueva canción a la base de datos
      const query = `CALL InsertCancion(?, ?, ?, ?, ?)`;
      const values = [name, photoData.Location, duration, artist, fileData.Location];

      // Ejecutar el procedimiento almacenado
      db.execute(query, values, async (err, result) => {
          if (err) {
              console.error('Error al insertar la canción en la base de datos:', err);
              return res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
          }

          // Obtener el ID de la canción insertada consultando la tabla
          const lastIdQuery = `SELECT LAST_INSERT_ID() AS id_cancion`; // Para MySQL
          db.execute(lastIdQuery, (err, rows) => {
              if (err) {
                  console.error('Error al obtener el ID de la canción:', err);
                  return res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
              }

              const songId = rows[0].id_cancion;

              // Crear la respuesta con el ID
              const response = {
                artist: artist,
                duration: duration,
                file: fileData.Location,
                name: name,
                photo: photoData.Location,  
                song_id:songId
              };

              res.status(201).json(response);
          });
      });

  } catch (error) {
      console.error('Error interno del servidor:', error);
      res.status(500).json({ message: 'Error interno del servidor: ' + error.message });
  }
});



//ENDPOINT PARA ACTUALIZAR CANCIONES
router.patch('/songs/:id', upload.fields([{ name: 'photo' }, { name: 'file' }]), (req, res) => {
  const songId = req.params.id;
  const { name, duration, artist } = req.body;
  const photo = req.files['photo'] ? req.files['photo'][0] : null;
  const file = req.files['file'] ? req.files['file'][0] : null;

  // Buscar la canción en la base de datos
  db.query('SELECT * FROM Cancion WHERE id_cancion = ?', [songId], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
      return res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
    }

    //console.log('Resultados de la consulta:', results);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Canción no encontrada3.' });
    }

    const song = results[0]; // Asegúrate de que `song` está definido
    console.log('Canción encontrada:', song);

    // Actualizar los campos de la canción
    const updatedSong = {
      artist: artist || song.artist,
      duration: duration || song.duration,
      file: song.file,
      name: name || song.name,
      photo: song.photo,
      song_id : songId
      
    };

    const uploadPhotoPromise = photo ? s3.upload({
      Bucket: bucketName,
      Key: `${photoFolder}/${photo.originalname}`,
      Body: photo.buffer,
      ContentType: photo.mimetype
    }).promise() : Promise.resolve({ Location: song.foto });

    const uploadFilePromise = file ? s3.upload({
      Bucket: bucketName,
      Key: `${fileFolder}/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype
    }).promise() : Promise.resolve({ Location: song.archivo });

    // Esperar a que se completen las cargas de archivos
    Promise.all([uploadPhotoPromise, uploadFilePromise])
      .then(([photoData, fileData]) => {
        updatedSong.photo = photoData.Location;
        updatedSong.file = fileData.Location;

        // Actualizar la canción en la base de datos
        const query = `CALL UpdateCancion(?, ?, ?, ?, ?, ?)`;
        const values = [songId, updatedSong.name, updatedSong.photo, updatedSong.duration, updatedSong.artist, updatedSong.file];

        db.query(query, values, (err, result) => {
          if (err) {
            console.error('Error al actualizar la canción en la base de datos:', err);
            return res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
          }

          res.status(200).json(updatedSong );
        });
      })
      .catch(error => {
        console.error('Error al subir archivos:', error);
        res.status(500).json({ message: 'Error interno del servidor: ' + error.message });
      });
  });
});


//ENDPOINT PARA ELIMINAR CANCION

router.delete('/songs/:song_id', (req, res) => {
  const songId = req.params.song_id;
  //console.log(`ID de la canción recibido para eliminación: ${songId}`); 

  // Verificar si la canción existe antes de eliminarla
  db.query('SELECT * FROM Cancion WHERE id_cancion = ?', [songId], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
      return res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Canción no encontrada song.',songId });
    }

    // Proceder con la eliminación usando el procedimiento almacenado
    const query = 'CALL DeleteCancion(?)';
    db.query(query, [songId], (err, result) => {
      if (err) {
        console.error('Error al eliminar la canción en la base de datos:', err);
        return res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
      }

      res.status(200).json({ message: 'Canción eliminada exitosamente.' });
    });
  });
});




module.exports = router;