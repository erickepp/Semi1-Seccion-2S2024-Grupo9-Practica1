// db.js
const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: '3.18.220.254',
    user: 'admin',
    password: '123',
    database: 'soundstream'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos');
});

module.exports = db;
