import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

# Configura el nombre de tu bucket y el archivo a cargar
BUCKET_NAME = 'tarea2-202002042'
FILE_PATH = 'Bad Bunny - Moscow Mule Un Verano Sin Ti.mp3'  # Cambia esto a la ruta de tu archivo
OBJECT_NAME = 'Canciones/Bad Bunny - Moscow Mule Un Verano Sin Ti.mp3'  # Nombre con el que se guardará en S3

# Configura tus credenciales (opcional si ya están en el archivo de credenciales)
AWS_ACCESS_KEY = 'AKIAQFLZDJO2QQ5D5FMN'
AWS_SECRET_KEY = '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'

# Crea una sesión de boto3
s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)

try:
    # Subir archivo
    s3.upload_file(FILE_PATH, BUCKET_NAME, OBJECT_NAME)
    print(f'Archivo {FILE_PATH} subido exitosamente a {BUCKET_NAME}/{OBJECT_NAME}.')
except FileNotFoundError:
    print(f'El archivo {FILE_PATH} no se encontró.')
except NoCredentialsError:
    print('Credenciales no encontradas.')
except PartialCredentialsError:
    print('Credenciales incompletas.')
except Exception as e:
    print(f'Ocurrió un error: {e}')
