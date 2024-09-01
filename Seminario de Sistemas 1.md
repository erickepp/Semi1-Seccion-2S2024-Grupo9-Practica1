---
title: Seminario de Sistemas 1

---

#  Seminario de Sistemas 1
## Manual Técnico G9

### Objetivos del manual

 - Ofrecer una explicación de la arquitectura utilizada para la elaboración de la plataforma soundstream.
 - Explicar las principales funcionalidades utilizadas para que la arquitectura funcione y el por que de estas.
 - Presentar una guia para que los futuros desarrolladores tengan el conocimiento necesario para poder darle mantenimiento al proyecto o actualizarlo  de ser necesario.
 ### Arquitectura
 Para el desarrollo de la plataforma soundstream se elijio como servicio cloud AWS para hacer uso de sus diferentes servicios y funcionalidades a continuacion se describira brevemente cada uno de los servicios utilizados para el desarrollo del proyecto.
 
 EC2
 ![Amazon EC2: Everything you need to know - DEV Community](https://media.dev.to/cdn-cgi/image/width=1600,height=900,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fwsrrq6s1f12v8jhe2ubj.png)
 - Maquina virtual la cual contiene el backend  de python de la aplicacion haciendo uso de dos grupos de seguridad para permitir acceso unicamente a los puertos necesarios.
 - Mauina virtual la cual contiene el backend de NodeJS de la aplicacion este es el segundo servidor utilizado para el desarrollo del proyecto, igualmente se hizo uso de 2 grupos de seguridad uno para la conexion SSH y el otro para permitir el accesso a los puertos necesarios HTTP, HTTPS y el puerto 3000
 - Balanceador de carga: se Debido a que tenemos dos backend hacemos uso de un balanceador de carga para distribuir de una forma mas eficiente la carga  para evitar saturar un servidor y asi garantizar que los servidores estaran funcionando por un tiempo mas prolongado.
 
S3
![What is Amazon S3?. An introduction to Amazon S3, with… | by Jovan S  Hernandez | Medium](https://miro.medium.com/v2/resize:fit:1160/0*PQM2oxNUUceATC30)
- Bucket multimedia: Tenemos un bucket multimedia con acceso al publico para hacer la gestión de las imagenes y de las canciones utilizadas en la aplicacion, disponemos de dos carpetas una llamada "Fotos" la cual albergará las fotos de perfil y las fotos utilizadas para las canciones o albums, tenemos otra carpeta llamada "Canciones" la cual contiene todas las canciones utilizadas en la plataforma.
RDS
![Toric + Amazon RDS | Data Integration](https://cdn.prod.website-files.com/601064f495f4b4967f921aa9/635884ad45bd4b4723f4bc39_202210-rds-logo.png)
Para contener la base de datos se hizo uso del servicio RDS para manejar la base de datos, en nuestro caso utilizamos MySQL para el desarrollo de esta aplicacion por lo que se hizo uso de los settings por defecto tales como el puerto 3306, usuario admin y una contraseña proporcionada por amazon.
### Diagrama entidad relación
![ERsoundstream](https://hackmd.io/_uploads/ryL-W8WnA.png)

### Usuarios IAM

Se hizo uso de 3 usuarios IAM los cuales se estaran explicando acontinuación.

1. Usuario Administrador_202002042
![image](https://hackmd.io/_uploads/S1T_-IZhR.png)
Este es el usuario de usos generales este usuario se creo con la finalidad de evitar el uso del usuraio root ya que eso es lo recomendado por la documentación de AWS

Permisos: AdministratorAccess

2. Usuario Bucket_user
![image](https://hackmd.io/_uploads/rJz_fIWhA.png)
El usuario Bucket_user es el encargado de estar controlando los buckets, tanto desde la creacion como estar monitoreando que las canciones sean agregadas y las fotos tambien, si en dado caso se necesitara que los buckets sean eliminados este usuario seria el responsable de realizar esa gestión

permisos: AmazonS3FullAccess

3. Usuario Ec2_user
![image](https://hackmd.io/_uploads/B1K0MI-3C.png)
El usuario Ec2_user es el encargado de llevar a cabo la gestión de la creacion de las instancias, monitoreas las instancias, encender las instancias, eliminar instancias y detener las instancias cada vez que sea necesario. Ademas de estas funcionalidades este usuario es el encargado de la creacion del balanceador de carga y de configurar dicho balanceador 

permisos: AmazonEC2FullAccess

### Imagenes con configuraciones
Instancias creadas
![image](https://hackmd.io/_uploads/SyIPXUZ3C.png)

Instancia Python en la cual se utilizaron dos grupos de seguridad una para la conexion SSH y la otra para el manejo de los puertos necesarios tales como el HTTP, HTTPS y el puerto 3000 haciendo uso de las caracteristicas de la capa gratuita
![image](https://hackmd.io/_uploads/B1G6XUbn0.png)

Instancia NodeJS en la cual se utilizaron dos grupos de seguridad una para la conexion SSH y la otra para el manejo de los puertos necesarios tales como el HTTP, HTTPS y el puerto 3000 haciendo uso de las caracteristicas de la capa gratuita
![image](https://hackmd.io/_uploads/HJ-VVUW30.png)

Balanceador de carga clasico, en el cual se configuró el endpoint check el cual servira para hacer los estados de comprobación y asi determinar si una instancia es optima para su  uso.
![image](https://hackmd.io/_uploads/BJ2YEUWn0.png)

Acá podemos visualizar las instancias utilizadas para que trbaje el balanceador
![image](https://hackmd.io/_uploads/SkwiVIZh0.png)
estos son los tiempos utilizados para la comprobación de estado asi como la configuración de la ruta de ping la cual es el endpoint check.
![image](https://hackmd.io/_uploads/H1DA4Ub3C.png)

Grupos de seguridad utilizados para el desarrollo de la aplicacion, se hizo uso unicamente de la configuración de reglas de entrada para limitar los puertos, ademas de dejar libre el origen para que sea accesible desde cualquier computadora. Acá la lista de grupos de seguridad
![image](https://hackmd.io/_uploads/ByxrBIZhC.png)

Configuración del grupo de seguridad Maquinas virtuales python y NodeJS donde se usan los puertos 443,80,3000

![image](https://hackmd.io/_uploads/r1oDr8Z3R.png)

Configuración del grupo de seguridad SSH haciendo uso del puerto 22

![image](https://hackmd.io/_uploads/rJEKrI-3R.png)

Coinfiguración del grupo de seguridad para la base de datos implementada en RDS haciendo uso unicamente del puerto 3306 que es el puerto por defecto para mysql

![image](https://hackmd.io/_uploads/SJyhHI-3C.png)

Para s3 se utilizaron dos buckets como bien se mencionó anteriormente uno es para toda la multimedia y el otro especificamente para el despliegue del frontend, esta es la captura de los buckets

![image](https://hackmd.io/_uploads/rkGVUIWhC.png)

Configuración del bucket multimedia: unicamente se dejo habilitado el acceso publico y la configuración de una politica para poder utilizar la multimedia desde el frontend

![image](https://hackmd.io/_uploads/BydvU8Z20.png)

Configuración del bucket frontend: al igual que el bucket multimedia en este solo se dejo con acceso publico y se habilitó el apartado para desplegar un sitio web estático

![image](https://hackmd.io/_uploads/S1XALU-n0.png)

Para la configuración de RDS se hizo de la manera simple unicamente con las configuraciónes minimas necesarias tales como el puerto 3306, usuario "admin" y una contraseña generada automáticamente. Ademas de activar la opcion de "Accesible publicamente" para poder conectarnos desde cualquier direccion de ip, mas allá de eso nos limitamos a usar las funcionalidades por defecto aptas para la capa gratuita de AWS y configurar el grupo de seguridad correcto para evitar el creado por default

![image](https://hackmd.io/_uploads/S1q5w8bh0.png)

### Conclusiones

- La configuración de grupos de seguridad es un aspecto importante en cuanto a temas de seguridad para evitar accesos no deseados tambien para mantener la integridad de la aplicación.
- El uso de usuarios IAM es algo indispensable siguiendo la teoría de asignar los permisos minimos necesarios para que una persona realice sus tareas y que no tenga accesos a los demas recuros y servicios para tener un mejor control de nuestro ecosistema.
- Es importante estar monitoreando los recursos utilizados  constantemente para no incurrir en gastos no deseados, apagar las instancias cuando no se vayan a utilizar y dejar de ultimo el servicio de RDS ya que en este servicio se cobra por petición.
