// db.js
const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
    host: 'practica1-semi1g9.cnsk26yc46hf.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'RzOyOWBmo5I6I4044dxi',
    database: 'soundstream'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos');
});

module.exports = db;
