---

### **Authentication Routes**

---

**Método:** `POST`  
**Ruta:** `/login`  
**Parámetros:** Ninguno  
**Cuerpo:** Objeto JSON con `email` y `password`  
**Descripción:** Autentica a un usuario basado en `email` y `password`. Devuelve un mensaje de éxito y datos del usuario si la autenticación es exitosa.

---

### **User Routes**

---

**Método:** `GET`  
**Ruta:** `/users`  
**Parámetros:** Ninguno  
**Descripción:** Recupera una lista de todos los usuarios.

---

**Método:** `GET`  
**Ruta:** `/users/<int:user_id>`  
**Route Parameters:**  
- `user_id` (requerido): El ID del usuario.  
**Descripción:** Recupera los detalles de un usuario específico por su ID.

---

**Método:** `POST`  
**Ruta:** `/users`  
**Cuerpo:** Datos del formulario con campos obligatorios `first_name`, `last_name`, `email`, `password`, `confirm_password`, `birth_date` y archivo `photo`.  
**Descripción:** Registra un nuevo usuario en la base de datos.

---

**Método:** `PATCH`  
**Ruta:** `/users/<int:user_id>`  
**Route Parameters:**  
- `user_id` (requerido): El ID del usuario a actualizar.  
**Cuerpo:** Datos del formulario con campos opcionales `first_name`, `last_name`, `email`, `password` y archivo `photo`.  
**Descripción:** Actualiza los detalles de un usuario específico.

---

### **Song Routes**

---

**Método:** `GET`  
**Ruta:** `/songs`  
**Parámetros:** Ninguno  
**Descripción:** Recupera una lista de todas las canciones.

---

**Método:** `GET`  
**Ruta:** `/songs/<int:song_id>`  
**Route Parameters:**  
- `song_id` (requerido): El ID de la canción.  
**Descripción:** Recupera los detalles de una canción específica por su ID.

---

**Método:** `POST`  
**Ruta:** `/songs`  
**Cuerpo:** Datos del formulario con `name`, `duration`, `artist`, `photo`, y `file`.  
**Descripción:** Registra una nueva canción en la base de datos.

---

**Método:** `PATCH`  
**Ruta:** `/songs/<int:song_id>`  
**Route Parameters:**  
- `song_id` (requerido): El ID de la canción a actualizar.  
**Cuerpo:** Datos del formulario con campos opcionales `name`, `duration`, `artist`, `photo`, y `file`.  
**Descripción:** Actualiza los detalles de una canción específica.

---

**Método:** `DELETE`  
**Ruta:** `/songs/<int:song_id>`  
**Route Parameters:**  
- `song_id` (requerido): El ID de la canción a eliminar.  
**Descripción:** Elimina la canción especificada.

---

### **Playlist Routes**

---

**Método:** `GET`  
**Ruta:** `/playlists?user_id=value`  
**Query Parameters:**  
- `user_id` (requerido): El ID del usuario.  
**Descripción:** Recupera todas las playlists creadas por el usuario especificado.

---

**Método:** `GET`  
**Ruta:** `/playlists/<int:playlist_id>`  
**Route Parameters:**  
- `playlist_id` (requerido): El ID de la playlist.  
**Descripción:** Recupera los detalles de una playlist específica por su ID.

---

**Método:** `POST`  
**Ruta:** `/playlists`  
**Cuerpo:** Datos del formulario con `name`, `description`, `background` y `user_id`.  
**Descripción:** Crea una nueva playlist para el usuario especificado.

---

**Método:** `PATCH`  
**Ruta:** `/playlists/<int:playlist_id>`  
**Route Parameters:**  
- `playlist_id` (requerido): El ID de la playlist a actualizar.  
**Cuerpo:** Datos del formulario con campos opcionales `name`, `description`, y `background`.  
**Descripción:** Actualiza los detalles de una playlist específica.

---

**Método:** `DELETE`  
**Ruta:** `/playlists/<int:playlist_id>`  
**Route Parameters:**  
- `playlist_id` (requerido): El ID de la playlist a eliminar.  
**Descripción:** Elimina la playlist especificada.

---

### **Song Playlist Routes**

---

**Método:** `GET`  
**Ruta:** `/song/playlists?user_id=value`  
**Query Parameters:**  
- `user_id` (requerido): El ID del usuario.  
**Descripción:** Recupera todas las playlists y sus canciones asociadas para el usuario especificado.

---

**Método:** `GET`  
**Ruta:** `/songs/playlists/<int:playlist_id>`  
**Route Parameters:**  
- `playlist_id` (requerido): El ID de la playlist.  
**Descripción:** Recupera todas las canciones dentro de una playlist específica.

---

**Método:** `POST`  
**Ruta:** `/songs/playlists`  
**Cuerpo:** Objeto JSON con `song_id` y `playlist_id`.  
**Descripción:** Añade una canción a una playlist específica.

---

**Método:** `DELETE`  
**Ruta:** `/song/playlists?song_id=value&playlist_id=value`  
**Query Parameters:**  
- `song_id` (requerido): El ID de la canción a eliminar de la playlist.  
- `playlist_id` (requerido): El ID de la playlist.  
**Descripción:** Elimina una canción de una playlist específica.

---

### **Favorite Routes**

---

**Método:** `GET`  
**Ruta:** `/favorites?user_id=value`  
**Query Parameters:**  
- `user_id` (requerido): El ID del usuario.  
**Descripción:** Recupera la lista de canciones favoritas del usuario especificado.

---

**Método:** `POST`  
**Ruta:** `/favorites`  
**Cuerpo:** Objeto JSON con `song_id` y `user_id`.  
**Descripción:** Registra una canción como favorita para un usuario específico.

---

**Método:** `DELETE`  
**Ruta:** `/favorites?song_id=value&user_id=value`  
**Query Parameters:**  
- `song_id` (requerido): El ID de la canción a eliminar de favoritos.  
- `user_id` (requerido): El ID del usuario.  
**Descripción:** Elimina una canción de la lista de favoritos del usuario.

---
