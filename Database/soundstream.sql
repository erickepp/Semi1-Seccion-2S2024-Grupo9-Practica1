Create database soundstream;
use soundstream;

create table Usuario(
id_usuario int not null primary key auto_increment,
nombre varchar(150)not null,
apellidos varchar(150)not null,
foto longtext not null,
correo  varchar(150)not null unique,
contra longtext not null,
confirmar_contra longtext not null,
fecha_nacimiento date
);

create table Cancion(
id_cancion int not null primary key auto_increment,
nombre varchar(150) not null, 
foto longtext not null,
duracion varchar(150) not null, 
artista varchar(150) not null, 
archivo longtext
);

create table Me_gusta(
id_cancion int not null,
id_usuario int not null,
primary key (id_cancion,id_usuario),
foreign key (id_cancion) references Cancion (id_cancion)ON DELETE CASCADE,
foreign key (id_usuario) references Usuario (id_usuario) ON DELETE CASCADE
);

create table Playlist(
id_playlist int not null primary key auto_increment,
nombre varchar(150) not null, 
descripcion varchar(150) not null, 
fondo longtext,
id_usuario int not null,
foreign key (id_usuario) references  Usuario (id_usuario)ON DELETE CASCADE
);

create table Lista_canciones(
id_cancion int not null,
id_playlist int not null,
primary key(id_playlist, id_cancion),
foreign key (id_cancion) references Cancion (id_cancion)ON DELETE CASCADE,
foreign key (id_playlist) references Playlist (id_playlist)ON DELETE CASCADE
);

-- PROCEDIMIENTOS ALMACENADOS

-- INSERTAR USUARIO
DELIMITER //

CREATE PROCEDURE InsertUsuario(
    IN p_nombre VARCHAR(150),
    IN p_apellidos VARCHAR(150),
    IN p_foto LONGTEXT,
    IN p_correo VARCHAR(150),
    IN p_contra VARCHAR(150),
    IN p_confirmar_contra VARCHAR(150),
    IN p_fecha_nacimiento DATE
)
BEGIN
    INSERT INTO Usuario (nombre, apellidos, foto, correo, contra, confirmar_contra, fecha_nacimiento)
    VALUES (p_nombre, p_apellidos, p_foto, p_correo, p_contra, p_confirmar_contra, p_fecha_nacimiento);
END //

DELIMITER ;

-- ACTUALIZAR DATOS USUARIO 
DELIMITER //

CREATE PROCEDURE UpdateUsuario(
    IN p_id_usuario INT,
    IN p_nombre VARCHAR(150),
    IN p_apellidos VARCHAR(150),
    IN p_foto LONGTEXT,
    IN p_correo VARCHAR(150)
)
BEGIN
    UPDATE Usuario
    SET nombre = p_nombre,
        apellidos = p_apellidos,
        foto = p_foto,
        correo = p_correo
    WHERE id_usuario = p_id_usuario;
END //

DELIMITER ;

-- INSERTAR CANCIONES

DELIMITER //

CREATE PROCEDURE InsertCancion(
    IN p_nombre VARCHAR(150),
    IN p_foto LONGTEXT,
    IN p_duracion VARCHAR(150),
    IN p_artista VARCHAR(150),
    IN p_archivo LONGTEXT
)
BEGIN
    INSERT INTO Cancion (nombre, foto, duracion, artista, archivo)
    VALUES (p_nombre, p_foto, p_duracion, p_artista, p_archivo);
END //

DELIMITER ;

-- ACTUALIZAR CANCIONES

DELIMITER //

CREATE PROCEDURE UpdateCancion(
    IN p_id_cancion INT,
    IN p_nombre VARCHAR(150),
    IN p_foto LONGTEXT,
    IN p_duracion VARCHAR(150),
    IN p_artista VARCHAR(150),
    IN p_archivo LONGTEXT
)
BEGIN
    UPDATE Cancion
    SET nombre = p_nombre,
        foto = p_foto,
        duracion = p_duracion,
        artista = p_artista,
        archivo = p_archivo
    WHERE id_cancion = p_id_cancion;
END //

DELIMITER ;

-- ELIMINAR CANCIONES
DELIMITER //

CREATE PROCEDURE DeleteCancion(
    IN p_id_cancion INT
)
BEGIN
    DELETE FROM Cancion WHERE id_cancion = p_id_cancion;
END //

DELIMITER ;

-- MOSTRAR DETALLE CANCION

 DELIMITER //
CREATE PROCEDURE DetalleCancion(
	IN p_id_cancion int
)
BEGIN
	SELECT * FROM Cancion WHERE id_cancion =p_id_cancion;
END//
DELIMITER ;

-- DAR ME GUSTA
DELIMITER //

CREATE PROCEDURE InsertMeGusta(
    IN p_id_cancion INT,
    IN p_id_usuario INT
)
BEGIN
    INSERT INTO Me_gusta (id_cancion, id_usuario)
    VALUES (p_id_cancion, p_id_usuario);
END //

DELIMITER ;

-- ELIMINAR ME GUSTA
DELIMITER //

CREATE PROCEDURE DeleteMeGusta(
    IN p_id_cancion INT,
    IN p_id_usuario INT
)
BEGIN
    DELETE FROM Me_gusta WHERE id_cancion = p_id_cancion AND id_usuario = p_id_usuario;
END //

DELIMITER ;

-- CREAR PLAYLIST
DELIMITER //

CREATE PROCEDURE InsertPlaylist(
    IN p_nombre VARCHAR(150),
    IN p_descripcion VARCHAR(150),
    IN p_fondo LONGTEXT,
    IN p_id_usuario INT
)
BEGIN
    INSERT INTO Playlist (nombre, descripcion, fondo, id_usuario)
    VALUES (p_nombre, p_descripcion, p_fondo, p_id_usuario);
END //

DELIMITER ;

-- ACTUALIZAR PLAYLIST
DELIMITER //

CREATE PROCEDURE UpdatePlaylist(
    IN p_id_playlist INT,
    IN p_nombre VARCHAR(150),
    IN p_descripcion VARCHAR(150),
    IN p_fondo LONGTEXT
)
BEGIN
    UPDATE Playlist
    SET nombre = p_nombre,
        descripcion = p_descripcion,
        fondo = p_fondo
    WHERE id_playlist = p_id_playlist;
END //

DELIMITER ;

-- ELIMINAR PLAYLIST
DELIMITER //

CREATE PROCEDURE DeletePlaylist(
    IN p_id_playlist INT
)
BEGIN
    DELETE FROM Playlist WHERE id_playlist = p_id_playlist;
END //

DELIMITER ;

-- AGREGAR CANCION PLAYLIST
DELIMITER //

CREATE PROCEDURE InsertListaCanciones(
    IN p_id_cancion INT,
    IN p_id_playlist INT
)
BEGIN
    INSERT INTO Lista_canciones (id_cancion, id_playlist)
    VALUES (p_id_cancion, p_id_playlist);
END //

DELIMITER ;

-- ELIMINAR CANCION PLAYLIST
DELIMITER //

CREATE PROCEDURE DeleteListaCanciones(
    IN p_id_cancion INT,
    IN p_id_playlist INT
)
BEGIN
    DELETE FROM Lista_canciones WHERE id_cancion = p_id_cancion AND id_playlist = p_id_playlist;
END //

DELIMITER ;

-- LOGIN

DELIMITER //

CREATE PROCEDURE VerificarUsuario(
    IN p_correo VARCHAR(150),
    IN p_contra VARCHAR(150)
)
BEGIN
    DECLARE contador INT;

    SELECT COUNT(*) INTO contador
    FROM Usuario
    WHERE correo = p_correo AND contra = p_contra;

    IF contador > 0 THEN
        SELECT TRUE AS Resultado;
    ELSE
        SELECT FALSE AS Resultado;
    END IF;
END //

DELIMITER ;


-- MOSTRAR CANCIONES PLAYLIST
DELIMITER //

CREATE PROCEDURE ObtenerCancionesDePlaylist(
    IN p_id_playlist INT
)
BEGIN
    SELECT c.id_cancion, c.nombre, c.artista, c.duracion, c.foto, c.archivo
    FROM Cancion c
    INNER JOIN Lista_canciones lc ON c.id_cancion = lc.id_cancion
    WHERE lc.id_playlist = p_id_playlist;
END //

DELIMITER ;

-- MOSTRAR CANCIONES FAVORITAS
DELIMITER //

CREATE PROCEDURE ObtenerCancionesFavoritas(
    IN p_id_usuario INT
)
BEGIN
    SELECT c.id_cancion, c.nombre, c.artista, c.duracion, c.foto, c.archivo
    FROM Cancion c
    INNER JOIN Me_gusta mg ON c.id_cancion = mg.id_cancion
    WHERE mg.id_usuario = p_id_usuario;
END //

DELIMITER ;

-- Ejemplos procedimientos.alter

call InsertUsuario("admin","admin","urlFoto","admin@admin.com","admin","admin" ,"1999-08-09");
call InsertUsuario("Fernando","Salazar","urlFoto","fernando@gmail.com","contra","contra" ,"1999-08-09");
call InsertUsuario("paulo","Salazar","urlFoto","paulo@gmail.com","contra","contra" ,"1999-08-09");
call InsertUsuario("jose","Salazar","urlFoto","jose@gmail.com","contra","contra" ,"1999-08-09");

call UpdateUsuario (1,"Pauloo","Meridaa","urlllFoto","paulito@gmail.com");

call InsertCancion("cancion1","url foto","duracion","artista cualquiera","URL cancion");
call InsertCancion("cancion2","url foto2","duracion","artista cualquiera2","URL cancion2");
call InsertCancion("cancion3","url foto3","duracion","artista cualquiera3","URL cancion3");

call UpdateCancion(3,"cancion33","url foto333","duracio333n","artista cualquiera3333","URL cancion3333");

call DeleteCancion(3);

-- id cancion , id usuario
call InsertMeGusta(1,1);
call InsertMeGusta(4,1);
call InsertMeGusta(1,2);


call DeleteMeGusta(2,1);

call InsertPlaylist("mi playlist1","descripcion","foto fondo","1");
call InsertPlaylist("mi playlist2","descripcion2","foto fondo2","2");

call UpdatePlaylist(2,"mi playlist2222","descripcion2222","foto fondo22222");

call DeletePlaylist(2);

-- id cancion, id playlist
call InsertListaCanciones(1,3);
call InsertListaCanciones(3,3);

-- id cancion, id playlist
call DeleteListaCanciones(2,1);

call VerificarUsuario("paulitoo@gmail.com","contra");

call ObtenerCancionesDePlaylist(2);

call ObtenerCancionesFavoritas(1);

call DetalleCancion(1);

select * from Usuario;
select * from Cancion;
select * from Me_gusta;
select * from Playlist;
select * from Lista_canciones;



