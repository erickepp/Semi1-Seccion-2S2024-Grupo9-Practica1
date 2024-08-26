const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('../conexion/conexion');

const router = express.Router();


//ENDPOINT PARA MOSTRAR TODAS LAS CANCIONES DE LA PLAYLIST DEL USUARIO
router.get('/songs/playlists/:playlist_id', async (req, res) => {
    const playlistId = parseInt(req.params.playlist_id);

    try {
        // Verificar si la playlist existe
        const [playlistResults] = await db.promise().query('SELECT * FROM Playlist WHERE id_playlist = ?', [playlistId]);

        if (playlistResults.length === 0) {
            return res.status(404).json({ message: 'Playlist no encontrada.' });
        }

        const playlist = playlistResults[0];

        // Obtener el usuario que creó la playlist
        const [userResults] = await db.promise().query('SELECT * FROM Usuario WHERE id_usuario = ?', [playlist.id_usuario]);

        if (userResults.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const user = userResults[0];

        // Obtener las canciones de la playlist
        const [songsResults] = await db.promise().query(
            `SELECT c.* FROM Lista_canciones lc
             JOIN Cancion c ON lc.id_cancion = c.id_cancion
             WHERE lc.id_playlist = ?`,
            [playlistId]
        );

        // Construir el objeto de respuesta
        const playlistResponse = {
            background: playlist.fondo,
            description: playlist.descripcion,
            name: playlist.nombre,
            playlist_id: playlist.id_playlist,
            songs: songsResults.map(song => ({
                
                artist: song.artista,
                duration: song.duracion,
                file: song.archivo,
                name: song.nombre,
                photo: song.foto,
                song_id: song.id_cancion
            })),
            user: {
                birth_date: user.fecha_nacimiento,
                email: user.correo,
                first_name: user.nombre,
                last_name: user.apellidos,
                photo: user.foto,
                user_id: user.id_usuario,
            }
        };

        return res.status(200).json(playlistResponse);
    } catch (error) {
        console.error('Error interno del servidor:', error);
        return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
    }
});

//ENDPOINT PARA OBTENER LAS PLAYLIST DEL USUARIO
// GET /songs/playlists/?user_id=value
router.get('/song/playlists', async (req, res) => {
    const userId = parseInt(req.query.user_id);

    try {
        // Verificar si el usuario existe
        const [userResults] = await db.promise().query('SELECT * FROM Usuario WHERE id_usuario = ?', [userId]);

        if (userResults.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Obtener las playlists del usuario
        const [playlistResults] = await db.promise().query('SELECT * FROM Playlist WHERE id_usuario = ?', [userId]);

        if (playlistResults.length === 0) {
            return res.status(200).json({ playlists: [] });
        }

        // Agregar canciones a cada playlist
        const playlistsWithSongs = await Promise.all(playlistResults.map(async (playlist) => {
            const [songResults] = await db.promise().query(
                `SELECT c.* FROM Lista_canciones lc
                 JOIN Cancion c ON lc.id_cancion = c.id_cancion
                 WHERE lc.id_playlist = ?`,
                [playlist.id_playlist]
            );

            return {
                background: playlist.fondo,
                description: playlist.descripcion,
                name: playlist.nombre,
                playlist_id: playlist.id_playlist,
              
              
                songs: songResults.map(song => ({
                    artist: song.artista,
                    duration: song.duracion,
                    file: song.archivo,
                    name: song.nombre,
                    photo: song.foto,
                    song_id: song.id_cancion,
                   
                  
                }))
            };
        }));

        // Construir el objeto de respuesta del usuario
        const userResponse = {
            birth_date: userResults[0].fecha_nacimiento,
            email: userResults[0].correo,
            first_name: userResults[0].nombre,
            last_name: userResults[0].apellidos,
            photo: userResults[0].foto,
            playlists: playlistsWithSongs,
            user_id: userResults[0].id_usuario,
    
        };

        return res.status(200).json(userResponse);
    } catch (error) {
        console.error('Error interno del servidor:', error);
        return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
    }
});


//ENDPOINT PARA AGREGAR CANCIONES A LAS PLAYLIST
router.post('/songs/playlists', async (req, res) => {
    
    try {
        const { song_id, playlist_id } = req.body;

        // Validar los datos recibidos
        if (!song_id || !playlist_id) {
            return res.status(400).json({ message: 'El song_id y el playlist_id son necesarios.' });
        }

        // Verificar si la canción y la playlist existen
        const [songResults] = await db.promise().query('SELECT * FROM Cancion WHERE id_cancion = ?', [song_id]);
        const [playlistResults] = await db.promise().query(
            `SELECT p.*, u.id_usuario AS user_id, u.nombre AS first_name, u.apellidos AS last_name, 
             u.fecha_nacimiento AS birth_date, u.correo AS email, u.foto AS photo 
             FROM Playlist p JOIN Usuario u ON p.id_usuario = u.id_usuario WHERE id_playlist = ?`,
            [playlist_id]
        );

        if (songResults.length === 0) {
            return res.status(404).json({ message: 'Canción no encontrada.' });
        }
        if (playlistResults.length === 0) {
            return res.status(404).json({ message: 'Playlist no encontrada.' });
        }

        // Verificar si la canción ya está en la playlist
        const [existingSongPlaylist] = await db.promise().query(
            'SELECT * FROM Lista_canciones WHERE id_cancion = ? AND id_playlist = ?',
            [song_id, playlist_id]
        );

        if (existingSongPlaylist.length > 0) {
            return res.status(400).json({ message: 'La canción ya está en la playlist.' });
        }

        // Insertar la nueva entrada en la tabla Lista_canciones
        await db.promise().query(
            'INSERT INTO Lista_canciones (id_cancion, id_playlist) VALUES (?, ?)',
            [song_id, playlist_id]
        );

        // Construir el JSON de respuesta
        const playlist = playlistResults[0];
        const song = songResults[0];

        const response = {
            playlist: {
                background: playlist.fondo,
                description: playlist.descripcion,
                name: playlist.nombre,
                playlist_id: playlist.id_playlist,
                user: {
                    birth_date: playlist.birth_date,
                    email: playlist.email,
                    first_name: playlist.first_name,
                    last_name: playlist.last_name,
                    photo: playlist.photo,
                    user_id: playlist.user_id,
                }
            },
            song: {
                artist: song.artista,
                duration: song.duracion,
                file: song.archivo,
                name: song.nombre,
                photo: song.foto,
                song_id: song.id_cancion,
            }
        };

        return res.status(201).json(response);
    } catch (error) {
        console.error('Error interno del servidor:', error);
        return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
    }
});

//ENDPOINT PARA ELIMINAR CANCIONES DE LA PLAYLIST
//MODIFICACION EN ESTE ENDPOINT
router.delete('/song/playlists', async (req, res) => {
    console.log("DELETE /songs/playlists endpoint called"); // Mensaje de depuración
    try {
        const { song_id, playlist_id } = req.query;

        if (!song_id || !playlist_id) {
            return res.status(400).json({ message: 'El song_id y el playlist_id son necesarios.' });
        }

        // Mensajes de depuración
        console.log(`Received song_id: ${song_id}`);
        console.log(`Received playlist_id: ${playlist_id}`);

        // Verificar si la canción existe
        const [songResults] = await db.promise().query('SELECT * FROM Cancion WHERE id_cancion = ?', [song_id]);
        if (songResults.length === 0) {
            console.log('Canción no encontrada.');
            return res.status(404).json({ message: 'Canción no encontrada.' });
        }

        // Verificar si la playlist existe
        const [playlistResults] = await db.promise().query('SELECT * FROM Playlist WHERE id_playlist = ?', [playlist_id]);
        if (playlistResults.length === 0) {
            console.log('Playlist no encontrada.');
            return res.status(404).json({ message: 'Playlist no encontrada.' });
        }

        // Buscar la entrada en Lista_canciones
        const [songPlaylistResults] = await db.promise().query(
            'SELECT * FROM Lista_canciones WHERE id_cancion = ? AND id_playlist = ?',
            [song_id, playlist_id]
        );
        if (songPlaylistResults.length === 0) {
            console.log('La canción no se encuentra en la playlist.');
            return res.status(404).json({ message: 'La canción no se encuentra en la playlist.' });
        }

        // Eliminar la entrada de Lista_canciones
        await db.promise().query(
            'DELETE FROM Lista_canciones WHERE id_cancion = ? AND id_playlist = ?',
            [song_id, playlist_id]
        );

        console.log('Canción eliminada de la playlist exitosamente.');
        return res.status(200).json({ message: 'Canción eliminada de la playlist exitosamente.' });
    } catch (error) {
        console.error('Error interno del servidor:', error);
        return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
    }
});

  



module.exports = router;