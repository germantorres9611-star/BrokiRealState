-- ═══════════════════════════════════════════════════════
--  BROKI INMOBILIARIA — MySQL Schema
--  Import in Hostinger hPanel → Databases → phpMyAdmin
--  Tables are also auto-created on first PHP API request.
-- ═══════════════════════════════════════════════════════

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Admin users
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `username`      VARCHAR(50)  NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `last_login`    DATETIME,
  `last_changed`  DATETIME,
  `created_at`    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin: broki / 1111
-- (bcrypt hash for "1111" with cost=12)
INSERT IGNORE INTO `admin_users` (`username`, `password_hash`)
VALUES ('broki', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Key-value settings store
CREATE TABLE IF NOT EXISTS `settings` (
  `key`       VARCHAR(100) PRIMARY KEY,
  `value`     LONGTEXT     NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default WhatsApp config
INSERT IGNORE INTO `settings` (`key`, `value`) VALUES
  ('whatsapp',    '{"number":"573507081756","message":"Hola, estoy interesado en conocer m\\u00e1s sobre sus apartamentos disponibles.","buttonText":"Escr\\u00edbenos"}'),
  ('site_content','{"heroTitle":"Broki Inmobiliaria","heroSubtitle":"Espacios que definen tu estilo de vida.","heroCta":"Ver Apartamentos","heroCtaSecondary":"Cont\\u00e1ctanos","contactPhone":"3507081756","contactEmail":"broki.inmobiliaria@gmail.com","contactWhatsapp":"573507081756"}'),
  ('pricing',     '[{"id":"economico","name":"Est\\u00e1ndar","priceRange":"Desde $350M COP","features":["Dise\\u00f1o Funcional","Ubicaci\\u00f3n Estrat\\u00e9gica","1-2 Habitaciones"]},{"id":"medio","name":"Avanzado","priceRange":"Desde $600M COP","features":["Acabados Premium","Dom\\u00f3tica B\\u00e1sica","Vistas Panor\\u00e1micas"]},{"id":"premium","name":"Signature","priceRange":"Desde $900M COP","features":["Arquitectura de Autor","Materiales Importados","Servicios Exclusivos"]}]'),
  ('gallery',      '[]'),
  ('hero_bg',      'null'),
  ('active_track', 'null'),
  ('audiovisual_svc', '{"visible":true,"title":"Producci\\u00f3n Audiovisual para Venta de Inmuebles","description":"Potenciamos la venta de inmuebles mediante contenido audiovisual profesional.","includes":["2 videos de alta calidad","Tomas a\\u00e9reas con dron","20 fotograf\\u00edas profesionales en alta calidad","Material para inventarios y promoci\\u00f3n","Ficha t\\u00e9cnica del inmueble"],"price":"$600.000 COP","commission":"2.8% sobre el valor final de venta","benefit":"El valor invertido en el trabajo audiovisual ser\\u00e1 devuelto al concretarse la venta con nosotros.","ownershipNote":"El propietario conserva todo el contenido realizado y puede utilizarlo libremente.","noExclusivity":true}'),
  ('brokerage_svc',  '{"visible":true,"title":"Corretaje y Administraci\\u00f3n de Arrendamientos","description":"Trabajamos bajo modalidad de corretaje con respaldo de aseguradoras reconocidas.","firstMonthCovers":["Comisi\\u00f3n inmobiliaria","Estudio de perfiles","P\\u00f3liza de arrendamiento","Gesti\\u00f3n documental"],"fromSecondMonthNote":"El propietario recibe el 100% del canon mensual sin descuentos adicionales.","benefits":["Filtro de clientes calificados","Proceso \\u00e1gil de colocaci\\u00f3n","Respaldo jur\\u00eddico durante la vigencia del contrato","Respaldo financiero mediante p\\u00f3liza de arrendamiento","Seguimiento permanente al inmueble","Acompa\\u00f1amiento profesional durante todo el proceso"]}');

-- Properties
CREATE TABLE IF NOT EXISTS `properties` (
  `id`          VARCHAR(20)  PRIMARY KEY,
  `name`        VARCHAR(200) NOT NULL,
  `location`    VARCHAR(200) NOT NULL DEFAULT '',
  `price`       BIGINT       NOT NULL DEFAULT 0,
  `area`        INT          NOT NULL DEFAULT 0,
  `bedrooms`    INT          NOT NULL DEFAULT 1,
  `bathrooms`   INT          NOT NULL DEFAULT 1,
  `description` TEXT,
  `images`      LONGTEXT,
  `category`    ENUM('economico','medio','premium') NOT NULL DEFAULT 'medio',
  `available`   TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Demo properties
INSERT IGNORE INTO `properties` (`id`,`name`,`location`,`price`,`area`,`bedrooms`,`bathrooms`,`description`,`images`,`category`) VALUES
('p1','OASIS CONCRETO','El Poblado, Medellín',850000000,120,2,2,'Apartamento de diseño brutalista con acabados en concreto expuesto y domótica avanzada. Vistas panorámicas a la ciudad.'            ,'["/images/demo-apt-1.png"]','premium'),
('p2','NOIR LOFT'      ,'Chapinero, Medellín' ,620000000, 85,1,1,'Loft de concepto abierto con tonos oscuros y luz tenue. Ideal para ejecutivos y creativos. Acabados mate y madera quemada.'      ,'["/images/demo-apt-2.png"]','medio'),
('p3','ESTUDIO ZERO'   ,'Laureles, Bogotá'    ,450000000, 60,1,1,'Espacio minimalista funcional. Menos es más. Diseñado para maximizar la entrada de luz natural conservando privacidad.'          ,'["/images/demo-apt-3.png"]','economico');

-- File uploads
CREATE TABLE IF NOT EXISTS `uploads` (
  `id`         VARCHAR(20)  PRIMARY KEY,
  `name`       VARCHAR(255) NOT NULL,
  `type`       ENUM('image','audio','hero_bg') NOT NULL,
  `mime_type`  VARCHAR(100),
  `path`       VARCHAR(500) NOT NULL,
  `url`        VARCHAR(500) NOT NULL,
  `size`       INT          DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity log
CREATE TABLE IF NOT EXISTS `activity_log` (
  `id`         VARCHAR(20)  PRIMARY KEY,
  `action`     VARCHAR(200) NOT NULL,
  `details`    TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
