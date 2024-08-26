const express = require('express');
const router = express.Router();
const multer = require('multer');
const AWS = require('aws-sdk');
const db = require('../conexion/conexion'); // Importar la conexión a la base de datos



//ENDPOINT PARA MOSTRAR LOS ME GUSTA DEL USUARIO
router.get('/favorites', (req, res) => {
    const userId = parseInt(req.query.user_id, 10);

    // Verificar si el ID del usuario es válido
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'ID de usuario es requerido y debe ser un número válido.' });
    }

    // Consultar la información del usuario
    const getUserQuery = 'SELECT * FROM Usuario WHERE id_usuario = ?';
    db.query(getUserQuery, [userId], (err, userResults) => {
        if (err) {
            console.error('Error al obtener la información del usuario:', err);
            return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
        }
        if (userResults.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const user = userResults[0];

        // Consultar los IDs de canciones favoritas del usuario
        const getFavoritesQuery = 'SELECT id_cancion FROM Me_gusta WHERE id_usuario = ?';
        db.query(getFavoritesQuery, [userId], (err, favoriteResults) => {
            if (err) {
                console.error('Error al obtener favoritos:', err);
                return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
            }

            // Si el usuario no tiene favoritos
            if (favoriteResults.length === 0) {
                return res.json({ 
                    songs: [],
                    user: {
                        birth_date: user.fecha_nacimiento,
                        email: user.correo,
                        first_name: user.nombre,
                        last_name: user.apellidos,
                        photo: user.foto,
                        user_id: user.id_usuario,
                       
                    }, 
                     
                });
            }

            // Extraer IDs de canciones
            const songIds = favoriteResults.map(row => row.id_cancion);

            // Consultar detalles de las canciones
            const getSongsQuery = 'SELECT * FROM Cancion WHERE id_cancion IN (?)';
            db.query(getSongsQuery, [songIds], (err, songResults) => {
                if (err) {
                    console.error('Error al obtener canciones:', err);
                    return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
                }

                // Mapear los detalles de las canciones
                const songs = songResults.map(song => ({
                    artist: song.artista,
                    duration: song.duracion,
                    file: song.archivo,
                    name: song.nombre,
                    photo: song.foto,
                    song_id: song.id_cancion,
                    
                }));

                // Devolver la respuesta
                res.json({
                    songs,
                    user: {
                        birth_date: user.fecha_nacimiento,
                        email: user.correo,
                        first_name: user.nombre,
                        last_name: user.apellidos,
                        photo: user.foto,
                        user_id: user.id_usuario,  
                        
                    },
                });
            });
        });
    });
});


//ENDPOINT PARA AGREGAR ME GUSTAS
router.post('/favorites', (req, res) => {
    const { song_id, user_id } = req.body;
  
    if (!song_id || !user_id) {
      return res.status(400).json({ message: 'El song_id y el user_id son necesarios.' });
    }
  
    // Verificar si la canción y el usuario existen
    const checkSongQuery = 'SELECT * FROM Cancion WHERE id_cancion = ?';
    const checkUserQuery = 'SELECT * FROM Usuario WHERE id_usuario = ?';
  
    // Verificar si la canción existe
    db.query(checkSongQuery, [song_id], (err, songResults) => {
      if (err) {
        console.error('Error al verificar la canción:', err);
        return res.status(500).json({ message: 'Error interno del servidor.' });
      }
      if (songResults.length === 0) {
        return res.status(404).json({ message: 'Canción no encontrada1.' });
      }
  
      // Verificar si el usuario existe
      db.query(checkUserQuery, [user_id], (err, userResults) => {
        if (err) {
          console.error('Error al verificar el usuario:', err);
          return res.status(500).json({ message: 'Error interno del servidor.' });
        }
        if (userResults.length === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
  
        // Verificar si la canción ya está en los favoritos
        const checkFavoriteQuery = 'SELECT * FROM Me_gusta WHERE id_cancion = ? AND id_usuario = ?';
        db.query(checkFavoriteQuery, [song_id, user_id], (err, favoriteResults) => {
          if (err) {
            console.error('Error al verificar favoritos:', err);
            return res.status(500).json({ message: 'Error interno del servidor.' });
          }
          if (favoriteResults.length > 0) {
            return res.status(400).json({ message: 'La canción ya está en los favoritos del usuario.' });
          }
  
          // Llamar al procedimiento almacenado para insertar en favoritos
          const insertFavoriteProcedure = 'CALL InsertMeGusta(?, ?)';
          db.query(insertFavoriteProcedure, [song_id, user_id], (err, insertResults) => {
            if (err) {
              console.error('Error al llamar al procedimiento InsertMeGusta:', err);
              return res.status(500).json({ message: 'Error interno del servidor.' });
            }
  
            // Verificar si la operación fue exitosa
            if (insertResults.affectedRows > 0) {
              // Obtener la información de la canción y del usuario para la respuesta
              const songDataQuery = 'SELECT * FROM Cancion WHERE id_cancion = ?';
              const userDataQuery = 'SELECT * FROM Usuario WHERE id_usuario = ?';
  
              db.query(songDataQuery, [song_id], (err, songDataResults) => {
                if (err) {
                  console.error('Error al obtener la información de la canción:', err);
                  return res.status(500).json({ message: 'Error interno del servidor.' });
                }
  
                db.query(userDataQuery, [user_id], (err, userDataResults) => {
                  if (err) {
                    console.error('Error al obtener la información del usuario:', err);
                    return res.status(500).json({ message: 'Error interno del servidor.' });
                  }
  
                  // Comprobar si se encontró la canción y el usuario
                  if (songDataResults.length === 0 || userDataResults.length === 0) {
                    return res.status(404).json({ message: 'Canción o usuario no encontrados.' });
                  }
  
                  const song = songDataResults[0];
                  const user = userDataResults[0];
  
                  // Formatear la respuesta
                  const response = {
                    song: {
                      artist: song.artista, // Asegúrate de usar los nombres correctos de las columnas
                      duration: song.duracion,
                      file: song.archivo,
                      name: song.nombre,
                      photo: song.foto,
                      song_id: song.id_cancion
                    },
                    user: {
                      birth_date: user.fecha_nacimiento,
                      email: user.correo,
                      first_name: user.nombre,
                      last_name: user.apellidos,
                      photo: user.foto,
                      user_id: user.id_usuario
                    }
                  };
  
                  // Devolver la respuesta con la información de la canción y del usuario
                  res.status(201).json(response);
                });
              });
            } else {
              res.status(500).json({ message: 'No se pudo registrar la canción como favorita.' });
            }
          });
        });
      });
    });
  });

//ENDPOINT PARA ELIMINAR ME GUSTA
///favorites?song_id=value&user_id=value
router.delete('/favorites', (req, res) => {
    const { song_id, user_id } = req.query;

    if (!song_id || !user_id) {
        return res.status(400).json({ message: 'song_id y user_id son requeridos.' });
    }

    const query = 'CALL DeleteMeGusta(?, ?)';
    db.query(query, [song_id, user_id], (err, results) => {
        if (err) {
            console.error('Error al ejecutar el procedimiento almacenado:', err);
            return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
        }

        // Verifica la estructura del resultado
        console.log('Results:', results); // Imprime la estructura de los resultados

        // Suponiendo que la estructura de resultados sea un array de arrays
        // en el caso de un procedimiento almacenado que devuelve varias filas
        if (results && results[0] && results[0][0] && results[0][0].affectedRows > 0) {
            return res.status(404).json({ message: 'Canción no encontrada en los favoritos del usuario.' });
        } else {
            return res.status(200).json({ message: 'Canción eliminada de los favoritos exitosamente.' });
        }
    });
});


module.exports = router;