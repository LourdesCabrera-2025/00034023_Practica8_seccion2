# 00034023_Practica8_Seccion2


### Diferencia entre autenticación y autorización

| Concepto     | Descripción                                                                       | Ejemplo                                         |
|--------------|-----------------------------------------------------------------------------------|-------------------------------------------------|
|Autenticación |Proceso de **verificar la identidad del usuario**, asegurando que es quien dice ser|Un usuario inicia sesión con correo y contraseña |
|Autorización  |Proceso de **defininir los permisos o accesos** que tiene el usuario autenticado   |Solo los administradores pueden eliminar usuarios|

> En resumen :
> - "Autenticación" → ¿Quién eres?
> - "Autorización" → ¿Que puedes hacer? 
>


----

### Token JWT (JSON Web Token)

| Proposito           | Descripción                                                                             |
|---------------------|-----------------------------------------------------------------------------------------|
| Identificación      | Representa al usuario autenticado en cada petición sin mantener sesiones en el servidor |
| Seguridad           | Se firma con una clave secreta (JWT_Secret) , lo que permite verificar su validez       |
| Transporte de datos | Contiene información codificada (como el id, email o rol ) que se envia al cliente      |
| Autorización        | Permite acceder a rutas protegidas solo si el token es valido                           |


----

### Flujo del JWT 

1. Usuario hace **login** → el servidor valida sus credenciales
2. si son correctas → el servidor **genera un JWT** con los datos del usuario
3. el cliente guarda ese token
4. para acceder a rutas protegidas → el cliente manda el token en el header
5. el servidor **verifica** el token → si es valido , autoriza la acción , si no responde con 401 Unauthorized