// userRoutes.js
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
const upload = multer({storage});

//configuracion AWS S3
/*const s3 = new AWS.S3({
    accessKeyId: 'AKIAZI2LIC4SXPO7JJV4',
    secretAccessKey: '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',
    region: 'us-east-2' // Por ejemplo, 'us-east-1'
});*/


// Middleware para parsear los datos del cuerpo de la solicitud
router.use(bodyParser.urlencoded({ extended: true }));


//ENDPOINT PARA  MOSTRAR USUARIOS
router.get('/users', async (req, res) => {
  try {
      // Consultar todos los usuarios
      const [results] = await db.promise().query('SELECT * FROM Usuario');

      // Formatear los resultados como una lista de objetos
      const users = results.map(user => ({
          birth_date: user.fecha_nacimiento,  
          email: user.correo,
          first_name: user.nombre,
          last_name: user.apellidos,
          photo: user.foto,           
          user_id: user.id_usuario         
      }));

      // Devolver los usuarios en formato JSON
      return res.status(200).json(users);
  } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
  }
});


//ENDPOINT PARA OBTENER UN USUARIO

router.get('/users/:user_id', async (req, res) => {
  const userId = req.params.user_id;

  try {
      // Consultar el usuario por ID
      const [results] = await db.promise().query('SELECT * FROM Usuario WHERE id_usuario = ?', [userId]);

      if (results.length > 0) {
          // Formatear el resultado del usuario como un objeto
          const user = results[0];
          const userData = {
              birth_date: user.fecha_nacimiento,
              email: user.correo,
              first_name: user.nombre,
              last_name: user.apellidos,
              photo: user.foto,
              user_id: user.id_usuario
          };

          // Devolver el usuario en formato JSON
          return res.status(200).json(userData);
      } else {
          // Usuario no encontrado
          return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
  } catch (error) {
      console.error('Error al obtener el usuario:', error);
      return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
  }
});





//ENDPONT DE REGISTRO DE USUARIOS
router.post('/users', upload.single('photo'), async (req, res) => {
  //const bucketName = 'tarea2-202011405';
  const folder = "Fotos";
  const objectKey = `${folder}/${req.file.originalname}`; // Carpeta + nombre del archivo

  try {
      const { first_name, last_name, email, password, confirm_password, birth_date } = req.body;
      const photo = req.file;

      // Validar la entrada
      if (!first_name || !last_name || !photo || !email || !password || !confirm_password || !birth_date) {
          return res.status(400).json({ message: 'Todos los campos son necesarios.' });
      }

      if (password !== confirm_password) {
          return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
      }

      // Convertir la cadena de birth_date a objeto de fecha
      let birthDate;
      try {
          birthDate = new Date(birth_date);
          if (isNaN(birthDate.getTime())) {
              throw new Error('Fecha de nacimiento inválida.');
          }
      } catch (error) {
          return res.status(400).json({ message: 'Fecha de nacimiento inválida.' });
      }

      // Subir archivo al bucket
      const uploadParams = {
          Bucket: bucketName,
          Key: objectKey,
          Body: req.file.buffer, // Archivo en memoria
          ContentType: req.file.mimetype // Tipo MIME del archivo
      };

      const data = await s3.upload(uploadParams).promise();
      const fileUrl = data.Location;

      // Encriptar la contraseña del usuario
      const hashedPassword = await bcrypt.hash(password, 10);

      // Llamar al procedimiento almacenado para insertar el usuario
      await new Promise((resolve, reject) => {
          db.query('CALL InsertUsuario(?, ?, ?, ?, ?, ?, ?)', [
              first_name,
              last_name,
              fileUrl,
              email,
              hashedPassword,
              hashedPassword, // Confirmación de contraseña si se usa en el procedimiento
              birthDate
          ], (err) => {
              if (err) {
                  reject(err);
              } else {
                  resolve();
              }
          });
      });

      // Consultar el último ID insertado
      db.query('SELECT LAST_INSERT_ID() AS id_usuario', (err, results) => {
          if (err) {
              console.error('Error al obtener el ID del usuario:', err);
              return res.status(500).json({ message: 'Error interno del servidor: ' + err.message });
          }

          const user_id = results[0].id_usuario;

          // Preparar la respuesta con los datos deseados
          const response = {
            birth_date: birthDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
            email: email,
            first_name: first_name,
            last_name: last_name,  
            photo: fileUrl,
            user_id: user_id,
                           
          };

          // Devolver la respuesta
          res.status(201).json(response);
      });
  } catch (error) {
      console.error('Error interno del servidor:', error);
      res.status(500).json({ message: 'Error interno del servidor: ' + error.message });
  }
});


//ENDPOINT PARA ACTUALIZAR DATOS DEL USUARIOS
router.patch('/users/:user_id', upload.single('photo'), async (req, res) => {
  const bucketName = 'tarea2-202011405';
  let folder = "Fotos";
  const objectKey = `${folder}/${req.file.originalname}`; // Carpeta + nombre del archivo
  const userId = parseInt(req.params.user_id, 10);

  try {
      const { first_name, last_name, email, password } = req.body;
      const photo = req.file;

      // Validar si el usuario existe
      const [userResults] = await db.promise().query('SELECT * FROM Usuario WHERE id_usuario = ?', [userId]);
      if (userResults.length === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });

      const user = userResults[0];

      // Actualizar los campos proporcionados
      if (password) {
          const hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
      }

      if (first_name) {
          user.first_name = first_name;
      }
      if (last_name) {
          user.last_name = last_name;
      }
      if (email) {
          user.email = email;
      }
      if (photo) {
          // Subir archivo al bucket
          const uploadParams = {
              Bucket: bucketName,
              Key: objectKey,
              Body: req.file.buffer, // Archivo en memoria
              ContentType: req.file.mimetype // Tipo MIME del archivo
          };

          const data = await s3.upload(uploadParams).promise();
          const fileUrl = data.Location;
          user.photo = fileUrl;
      }

      // Llamar al procedimiento almacenado para actualizar el usuario
      await db.promise().query('CALL UpdateUsuario(?, ?, ?, ?, ?)', [
          userId,
          user.first_name,
          user.last_name,
          user.photo || user.photo,
          user.email,
          user.password,
           // Mantener la foto existente si no se proporciona una nueva
          
      ]);

      // Crear un objeto con los campos deseados
      const response = {
        birth_date: user.fecha_nacimiento,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        photo: user.photo || user.photo, 
        user_id: userId,
          
      };

      // Devolver la respuesta con solo los campos necesarios
      res.status(200).json(response);
  } catch (error) {
      console.error('Error interno del servidor:', error);
      res.status(500).json({ message: 'Error interno del servidor: ' + error.message });
  }
});





// Ruta de login


module.exports = router;
