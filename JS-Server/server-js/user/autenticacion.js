const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../conexion/conexion'); // Ajusta la ruta según sea necesario

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Todos los campos son necesarios.' });
  }

  // Realizar una consulta directa
  db.query(
    'SELECT fecha_nacimiento, correo, nombre, apellidos, foto, id_usuario, contra FROM Usuario WHERE correo = ?',
    [email],
    (err, results) => {
      if (err) {
        console.error('Error en la consulta:', err);
        return res
          .status(500)
          .json({ message: `Error interno del servidor: ${err.message}` });
      }

      // Verificar si el usuario existe
      if (results.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      const user = results[0]; // `results` es un array, `results[0]` es el primer registro

      // Asegúrate de que `user.contra` y `password` están definidos
      if (typeof user.contra !== 'string' || typeof password !== 'string') {
        return res
          .status(500)
          .json({ message: 'Datos de contraseña inválidos.' });
      }

      // Comparar la contraseña proporcionada (texto plano) con el hash almacenado
      bcrypt.compare(password, user.contra, (err, result) => {
        if (err) {
          console.error('Error al comparar contraseñas:', err);
          return res
            .status(500)
            .json({ message: `Error interno del servidor: ${err.message}` });
        }

        if (!result) {
          return res.status(401).json({ message: 'Contraseña incorrecta.' });
        }

        // Contraseña correcta, se mapea el usuario al formato deseado
        const userData = {
          birth_date: user.fecha_nacimiento,
          email: user.correo,
          first_name: user.nombre,
          last_name: user.apellidos,
          photo: user.foto,
          user_id: user.id_usuario,
        };

        res.status(200).json({ message: 'Autenticación exitosa.', user: userData });
      });
    }
  );
});


module.exports = router;

