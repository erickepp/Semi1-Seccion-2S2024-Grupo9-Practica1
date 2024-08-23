const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');

// Configura AWS
AWS.config.update({
    accessKeyId: 'AKIAQFLZDJO2QQ5D5FMN',
    secretAccessKey: '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',
    region: 'us-east-2' // Por ejemplo, 'us-east-1'
});

const s3 = new AWS.S3();
const app = express();
const port = 3000;

// Configuración de Multer para manejar la carga de archivos
const storage = multer.memoryStorage(); // Usa memoria para archivos subidos
const upload = multer({ storage: storage });

// Ruta para subir archivos a S3
app.post('/aws', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const bucketName = 'tarea2-202002042';
    let folder;

    // Determina la carpeta en función del tipo MIME del archivo
    if (req.file.mimetype.startsWith('image/')) {
        folder = 'Fotos'; // Carpeta para imágenes
    } else if (req.file.mimetype.startsWith('audio/')) {
        folder = 'Canciones'; // Carpeta para archivos de audio
    } else {
        return res.status(400).send('Tipo de archivo no soportado.');
    }

    const objectKey = `${folder}/${req.file.originalname}`; // Carpeta + nombre del archivo

    const uploadParams = {
        Bucket: bucketName,
        Key: objectKey,
        Body: req.file.buffer, // Archivo en memoria
        ContentType: req.file.mimetype // Tipo MIME del archivo
    };

    s3.upload(uploadParams, (err, data) => {
        if (err) {
            console.error('Error al subir archivo:', err);
            return res.status(500).send('Error al subir archivo.');
        }
        res.send(`Archivo subido exitosamente. URL: ${data.Location}`);
    });
});

app.get('/', (req, res) => {
  res.send('¡Hola Mundo!');
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
