# Guía de Despliegue — BROKI INMOBILIARIA en Hostinger Business

## Arquitectura en Hostinger

```
public_html/
├── index.html          ← SPA React (entrada)
├── assets/             ← JS/CSS de Vite build
├── images/             ← Imágenes estáticas (demo)
├── api/                ← PHP API (este directorio)
│   ├── config.php
│   ├── auth.php
│   ├── settings.php
│   ├── properties.php
│   ├── upload.php
│   ├── tracks.php
│   └── activity.php
├── uploads/            ← Archivos subidos desde el admin
│   ├── images/
│   ├── audio/
│   └── .htaccess
└── .htaccess           ← Routing SPA + seguridad
```

---

## Paso 1: Crear la Base de Datos en Hostinger

1. Ir a **hPanel → Bases de Datos → Administrar**
2. Crear nueva base de datos:
   - Nombre: `broki` (quedará como `u123456789_broki`)
   - Usuario: `broki` (quedará como `u123456789_broki`)
   - Contraseña: (anotar para el siguiente paso)
3. **Opcional:** Importar `database.sql` via phpMyAdmin
   - hPanel → Bases de Datos → phpMyAdmin → Importar
   - Las tablas también se crean automáticamente en el primer request PHP

---

## Paso 2: Configurar las credenciales PHP

Editar `api/config.php` (líneas 11–14):

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_broki');  // ← tu base de datos
define('DB_USER', 'u123456789_broki');  // ← tu usuario
define('DB_PASS', 'tu_contraseña_segura'); // ← tu contraseña
```

---

## Paso 3: Build de producción

En tu máquina local o en Replit, ejecutar:

```bash
pnpm --filter @workspace/broki-inmobiliaria run build:hostinger
```

Esto genera `artifacts/broki-inmobiliaria/dist-hostinger/` con todos los archivos estáticos del sitio.

---

## Paso 4: Subir archivos a Hostinger

Usar el **Administrador de Archivos** de hPanel o FTP (FileZilla):

### Estructura a subir:

```
# Del build de React:
dist-hostinger/*  →  public_html/

# Del directorio hostinger-deploy/:
hostinger-deploy/.htaccess          →  public_html/.htaccess
hostinger-deploy/api/               →  public_html/api/
hostinger-deploy/uploads/           →  public_html/uploads/
```

### Orden de subida:
1. Subir contenido de `dist-hostinger/` a `public_html/`
2. Subir `hostinger-deploy/.htaccess` a `public_html/.htaccess`
3. Subir carpeta `hostinger-deploy/api/` a `public_html/api/`
4. Crear carpeta `public_html/uploads/images/` y `public_html/uploads/audio/`
5. Subir `hostinger-deploy/uploads/.htaccess` a `public_html/uploads/.htaccess`

---

## Paso 5: Verificar permisos

En el Administrador de Archivos de hPanel:
- `public_html/uploads/` → permisos **755**
- `public_html/uploads/images/` → permisos **755**
- `public_html/uploads/audio/` → permisos **755**
- Archivos PHP en `api/` → permisos **644**

---

## Paso 6: Verificar el despliegue

Abrir en el navegador: `https://tudominio.com`

### Checklist:

| Función | URL de prueba | Esperado |
|---|---|---|
| ✅ Sitio público | `/` | Hero con animación de agua |
| ✅ Login admin | `/admin/login` | Formulario de login |
| ✅ Login `broki/1111` | POST a `/api/auth.php` | Acceso al panel |
| ✅ API health | `/api/settings.php?key=whatsapp` | JSON con número |
| ✅ Propiedades | `/admin/properties` | Lista de apartamentos |
| ✅ Subir imagen | Admin → Archivos | Imagen en `/uploads/images/` |
| ✅ Subir música | Admin → Música | Audio en `/uploads/audio/` |
| ✅ Cambiar contraseña | Admin → Config → Seguridad | Hash bcrypt actualizado |
| ✅ WhatsApp config | Admin → Config → WhatsApp | Guardado en MySQL |
| ✅ Servicios | Admin → Config → Servicios | Editables y guardados |
| ✅ Actividad | Admin → Config → Actividad | Log en MySQL |

---

## Credenciales predeterminadas

| Campo | Valor |
|---|---|
| Usuario admin | `broki` |
| Contraseña | `1111` |
| WhatsApp default | `+57 350 708 1756` |

⚠️ **Cambiar la contraseña inmediatamente** desde Admin → Configuración → Seguridad.

---

## Solución de problemas

### Error 500 en `/api/`
- Revisar credenciales DB en `api/config.php`
- Verificar que PHP 8.0+ esté activo en hPanel → PHP Configuration
- Revisar logs en hPanel → Error Logs

### Página en blanco (404 en rutas)
- Verificar que `.htaccess` esté en `public_html/` (no dentro de subcarpeta)
- Activar `mod_rewrite` en hPanel si está disponible

### No se suben imágenes/audio
- Verificar permisos 755 en `public_html/uploads/`
- Verificar que `upload_max_filesize` y `post_max_size` sean ≥ 10M en PHP settings
- En hPanel → PHP Configuration → Valores personalizados

### Sesión admin expira
- Revisar `session.cookie_secure` en `api/config.php` (debe ser `'1'` con HTTPS)
- Verificar que el dominio use HTTPS (Hostinger incluye SSL gratis)

---

## PHP Requerido

- PHP **8.0 o superior** (Hostinger Business incluye PHP 8.2)
- Extensiones: `pdo_mysql`, `fileinfo`, `json` (todas habilitadas por defecto en Hostinger)
- MySQL 5.7 o MariaDB 10.3+

---

## Notas importantes

- **Los datos persisten en MySQL**: a diferencia de localStorage, todos los cambios del admin se guardan en la base de datos y son visibles desde cualquier dispositivo/navegador.
- **Las imágenes y audios**: se guardan físicamente en `/uploads/`. Hacer backup periódico de esta carpeta.
- **Backup recomendado**: exportar la DB mensualmente desde phpMyAdmin.
