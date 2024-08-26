const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const db = require('../conexion/conexion'); // Importar la conexión a la base de datos
const { s3, bucketName } = require('../server/bucket');
// Configura AWS SDK
//configuracion AWS S3
/*const s3 = new AWS.S3({
    accessKeyId: 'AKIAZI2LIC4SXPO7JJV4',
    secretAccessKey: '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',
    region: 'us-east-2' // Por ejemplo, 'us-east-1'
});

const bucketName = 'tarea2-202011405';*/

// Configura multer para manejar la carga de archivos
const upload = multer({ 
  storage: multer.memoryStorage(), // Usa memoria para almacenar archivos en buffer
  limits: { fileSize: 10 * 1024 * 1024 } // Límite de tamaño del archivo (10 MB)
});



//ENDPOINT PARA BUSCAR TODAS LAS PLAYLIST DEL USUARIO
//GET /playlists?user_id=value
router.get('/playlists', (req, res) => {
  const userId = parseInt(req.query.user_id, 10);

  if (!userId) {
    return res.status(400).json({ message: 'ID de usuario es requerido.' });
  }

  // Consulta para obtener playlists del usuario
  const query = 'SELECT * FROM Playlist WHERE id_usuario = ?';
  
  db.query(query, [userId], (err, playlistResults) => {
    if (err) {
      console.error('Error al obtener playlists:', err);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }

    // Comprobar si hay resultados
    if (playlistResults.length === 0) {
      return res.status(404).json({ message: 'No se encontraron playlists para el usuario.' });
    }

    // Obtener el ID del usuario para consultas adicionales
    const userQuery = 'SELECT * FROM Usuario WHERE id_usuario = ?';
    
    db.query(userQuery, [userId], (err, userResults) => {
      if (err) {
        console.error('Error al obtener la información del usuario:', err);
        return res.status(500).json({ message: 'Error interno del servidor.' });
      }

      // Comprobar si hay resultados
      if (userResults.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      // Obtener la información del usuario
      const user = userResults[0];

      // Formatear las playlists con la información del usuario
      const formattedPlaylists = playlistResults.map(playlist => ({
        background: playlist.fondo, 
        description: playlist.descripcion,
        name: playlist.nombre,
        playlist_id: playlist.id_playlist,
        user: {
          birth_date: user.fecha_nacimiento,
          email: user.correo,
          first_name: user.nombre,
          last_name: user.apellidos,
          photo: user.foto,
          user_id: user.id_usuario
        }
      }));

      // Devolver las playlists formateadas
      res.status(200).json(formattedPlaylists);
    });
  });
});


// Ruta para obtener una playlist por su ID
router.get('/playlists/:playlist_id', (req, res) => {
  const playlistId = parseInt(req.params.playlist_id, 10);

  if (isNaN(playlistId)) {
    return res.status(400).json({ message: 'ID de playlist inválido.' });
  }

  // Consulta para obtener la playlist por su ID
  const playlistQuery = 'SELECT * FROM Playlist WHERE id_playlist = ?';
  
  db.query(playlistQuery, [playlistId], (err, playlistResults) => {
    if (err) {
      console.error('Error al obtener la playlist:', err);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }

    // Comprobar si se encontró la playlist
    if (playlistResults.length === 0) {
      return res.status(404).json({ message: 'Playlist no encontrada.' });
    }

    const playlist = playlistResults[0];

    // Obtener el ID del usuario asociado a la playlist
    const userQuery = 'SELECT * FROM Usuario WHERE id_usuario = ?';
    
    db.query(userQuery, [playlist.id_usuario], (err, userResults) => {
      if (err) {
        console.error('Error al obtener la información del usuario:', err);
        return res.status(500).json({ message: 'Error interno del servidor.' });
      }

      // Comprobar si se encontró el usuario
      if (userResults.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      // Obtener la información del usuario
      const user = userResults[0];

      // Formatear la respuesta
      const formattedPlaylist = {
        background: playlist.fondo, 
        description: playlist.descripcion,
        name: playlist.nombre,
        playlist_id: playlist.id_playlist,
        user: {
          birth_date: user.fecha_nacimiento,
          email: user.correo,
          first_name: user.nombre,
          last_name: user.apellidos,
          photo: user.foto,
          user_id: user.id_usuario
        }
      };

      // Devolver la playlist formateada
      res.status(200).json(formattedPlaylist);
    });
  });
});


// Ruta para registrar una nueva playlist
router.post('/playlists', upload.single('background'), (req, res) => {
  const { name, description, user_id } = req.body;
  const background = req.file;

  // Validar la entrada
  if (!name || !description || !user_id || !background) {
    return res.status(400).json({ message: 'Todos los campos son necesarios.' });
  }

  // Subir archivo al bucket S3
  const folder = "Fondos";
  const objectKey = `${folder}/${background.originalname}`; // Carpeta + nombre del archivo
  const uploadParams = {
    Bucket: bucketName,
    Key: objectKey,
    Body: background.buffer, // Archivo en memoria
    ContentType: background.mimetype // Tipo MIME del archivo
  };

  s3.upload(uploadParams, (err, data) => {
    if (err) {
      console.error('Error al subir el archivo:', err);
      return res.status(500).json({ message: `Error al subir el archivo: ${err.message}` });
    }

    const backgroundUrl = data.Location;

    // Llamar al procedimiento almacenado para insertar la playlist
    const insertPlaylistQuery = 'CALL InsertPlaylist(?, ?, ?, ?)';
    const playlistValues = [name, description, backgroundUrl, user_id];

    db.query(insertPlaylistQuery, playlistValues, (err) => {
      if (err) {
        console.error('Error al insertar la playlist en la base de datos:', err);
        return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
      }

      // Obtener el último ID insertado
      const getLastIdQuery = 'SELECT LAST_INSERT_ID() AS playlist_id';

      db.query(getLastIdQuery, (err, result) => {
        if (err) {
          console.error('Error al obtener el último ID:', err);
          return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
        }

        const playlistId = result[0].playlist_id;

        // Consultar la información del usuario
        const userQuery = 'SELECT * FROM Usuario WHERE id_usuario = ?';
        db.query(userQuery, [user_id], (err, userResults) => {
          if (err) {
            console.error('Error al obtener la información del usuario:', err);
            return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
          }

          if (userResults.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
          }

          const user = userResults[0];

          // Devolver la nueva playlist con la información del usuario
          res.status(201).json({
            background: backgroundUrl,
            description: description,
            name: name,
            playlist_id: playlistId,
            user: {
              birth_date: user.fecha_nacimiento,
              email: user.correo,
              first_name: user.nombre,
              last_name: user.apellidos,
              photo: user.foto,
              user_id: user.id_usuario
            }
          });
        });
      });
    });
  });
});

//ENDPOINT PARA ACTUALIZAR LA PLAYLIST
router.patch('/playlists/:playlist_id', upload.single('background'), (req, res) => {
  const playlistId = req.params.playlist_id;
  const { name, description } = req.body;
  const background = req.file;

  // Consulta la playlist por ID para asegurarse de que exista
  db.query('SELECT * FROM Playlist WHERE id_playlist = ?', [playlistId], (err, results) => {
    if (err) {
      console.error('Error al consultar la playlist:', err);
      return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Playlist no encontrada.' });
    }

    // Si se subió un nuevo fondo, súbelo a S3
    if (background) {
      const folder = "Fondos";
      const objectKey = `${folder}/${background.originalname}`;
      const uploadParams = {
        Bucket: bucketName,
        Key: objectKey,
        Body: background.buffer,
        ContentType: background.mimetype
      };

      s3.upload(uploadParams, (err, data) => {
        if (err) {
          console.error('Error al subir el archivo:', err);
          return res.status(500).json({ message: `Error al subir el archivo: ${err.message}` });
        }

        const backgroundUrl = data.Location;

        // Llama al procedimiento almacenado para actualizar la playlist
        db.query('CALL UpdatePlaylist(?, ?, ?, ?)', [playlistId, name, description, backgroundUrl], (err, result) => {
          if (err) {
            console.error('Error al actualizar la playlist en la base de datos:', err);
            return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
          }

          // Obtener la información actualizada de la playlist y del usuario
          db.query('SELECT * FROM Playlist WHERE id_playlist = ?', [playlistId], (err, playlistResults) => {
            if (err) {
              console.error('Error al obtener la información de la playlist:', err);
              return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
            }

            if (playlistResults.length === 0) {
              return res.status(404).json({ message: 'Playlist no encontrada.' });
            }

            const playlist = playlistResults[0];

            // Obtener la información del usuario asociado a la playlist
            db.query('SELECT * FROM Usuario WHERE id_usuario = ?', [playlist.id_usuario], (err, userResults) => {
              if (err) {
                console.error('Error al obtener la información del usuario:', err);
                return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
              }

              if (userResults.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
              }

              const user = userResults[0];

              // Devolver la playlist actualizada con la información del usuario
              res.status(200).json({
                background: playlist.fondo,
                description: playlist.descripcion,
                name: playlist.nombre,
                playlist_id: playlist.id_playlist,
                user: {
                  birth_date: user.fecha_nacimiento,
                  email: user.correo,
                  first_name: user.nombre,
                  last_name: user.apellidos,
                  photo: user.foto,
                  user_id: user.id_usuario
                }
              });
            });
          });
        });
      });
    } else {
      // Si no se sube un nuevo fondo, solo actualiza el nombre y la descripción
      db.query('CALL UpdatePlaylist(?, ?, ?, NULL)', [playlistId, name, description], (err, result) => {
        if (err) {
          console.error('Error al actualizar la playlist en la base de datos:', err);
          return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
        }

        // Obtener la información actualizada de la playlist y del usuario
        db.query('SELECT * FROM Playlist WHERE id_playlist = ?', [playlistId], (err, playlistResults) => {
          if (err) {
            console.error('Error al obtener la información de la playlist:', err);
            return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
          }

          if (playlistResults.length === 0) {
            return res.status(404).json({ message: 'Playlist no encontrada.' });
          }

          const playlist = playlistResults[0];

          // Obtener la información del usuario asociado a la playlist
          db.query('SELECT * FROM Usuario WHERE id_usuario = ?', [playlist.id_usuario], (err, userResults) => {
            if (err) {
              console.error('Error al obtener la información del usuario:', err);
              return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
            }

            if (userResults.length === 0) {
              return res.status(404).json({ message: 'Usuario no encontrado.' });
            }

            const user = userResults[0];

            // Devolver la playlist actualizada con la información del usuario
            res.status(200).json({
              background: playlist.fondo,
              description: playlist.descripcion,
              name: playlist.nombre,
              playlist_id: playlist.id_playlist,
              user: {
                birth_date: user.fecha_nacimiento,
                email: user.correo,
                first_name: user.nombre,
                last_name: user.apellidos,
                photo: user.foto,
                user_id: user.id_usuario
              }
            });
          });
        });
      });
    }
  });
});
//ENDPOINT PARA ELIMINAR PLAYLIST
router.delete('/playlists/:playlist_id', (req, res) => {
  const playlistId = req.params.playlist_id;

  // Verificar si la playlist existe
  db.query('SELECT * FROM Playlist WHERE id_playlist = ?', [playlistId], (err, results) => {
      if (err) {
          console.error('Error al consultar la playlist:', err);
          return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
      }

      if (results.length === 0) {
          return res.status(404).json({ message: 'Playlist no encontrada.' });
      }

      // Llamar al procedimiento almacenado para eliminar la playlist
      db.query('CALL DeletePlaylist(?)', [playlistId], (err, result) => {
          if (err) {
              console.error('Error al eliminar la playlist en la base de datos:', err);
              return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
          }

          return res.status(200).json({ message: 'Playlist eliminada exitosamente.' });
      });
  });
});



module.exports = router;