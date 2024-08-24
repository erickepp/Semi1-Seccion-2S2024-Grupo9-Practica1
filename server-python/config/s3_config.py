import os
import boto3
import filetype
from dotenv import load_dotenv

load_dotenv()

aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
aws_bucket_name = os.getenv('AWS_BUCKET_NAME')
aws_bucket_region = os.getenv('AWS_BUCKET_REGION')

class S3:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            region_name=aws_bucket_region,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key
        )
    
    def upload_file(self, file, object_name):
        try:
            # Detecta el tipo MIME del archivo
            file_bytes = file.read()
            kind = filetype.guess(file_bytes)
            file.seek(0)  # Vuelve al principio del archivo
            
            if kind is None:
                raise ValueError('No se pudo determinar el tipo MIME del archivo.')
            
            file_type = kind.mime
            
            # Subir el archivo al bucket S3
            self.s3_client.upload_fileobj(
                file,
                aws_bucket_name,
                object_name,
                ExtraArgs={'ContentType': file_type}
            )
            
            # Obtener la URL pública del archivo subido
            file_url = f'https://{aws_bucket_name}.s3.{aws_bucket_region}.amazonaws.com/{object_name}'
            return file_url
        except Exception as e:
            raise RuntimeError(
                f'Error al subir el archivo "{object_name}" al bucket "{aws_bucket_name}": {str(e)}'
            )
