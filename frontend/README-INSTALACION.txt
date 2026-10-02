JONZKO SPORT - CATÁLOGO ESTÁTICO
================================

Esta versión NO usa:
- Angular
- Spring Boot / Java
- MySQL
- Railway
- APIs
- Login / registro
- Carrito / checkout
- Panel admin

Solo usa:
- index.html
- styles.css
- script.js
- assets/

EDITAR PRODUCTOS
----------------
Abre script.js.
Al comienzo encontrarás CONFIG y PRODUCTS.
Ahí puedes cambiar:
- Número de WhatsApp
- Nombre del producto
- Categoría
- Precio
- Precio anterior
- Imagen
- Tallas
- Descripción

WHATSAPP
--------
El número actual configurado es 51998989599.
Formato Perú: 51 + los 9 dígitos, sin +, espacios ni guiones.

SUBIR A VERCEL (RECOMENDADO PARA CONSERVAR TU DOMINIO)
-------------------------------------------------------
1. Reemplaza el contenido de la carpeta frontend de tu repositorio por los archivos de esta carpeta.
2. Puedes eliminar backend/ si ya no lo usarás.
3. Haz commit y push a GitHub.
4. Si tu proyecto Vercel ya apunta a frontend/, deja Root Directory = frontend.
5. Framework Preset: Other.
6. No necesitas Build Command.
7. Output Directory: déjalo vacío.
8. El dominio jonzko.lat puede seguir conectado al mismo proyecto Vercel.
9. Railway ya no es necesario y puede permanecer apagado/eliminarse cuando confirmes que el nuevo sitio funciona.

IMPORTANTE
----------
Un dominio por sí solo no muestra una web: siempre necesita hosting.
Para esta página estática, Vercel o GitHub Pages pueden alojarla gratis.
