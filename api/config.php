<?php
declare(strict_types=1);

// ═══════════════════════════════════════════════════
//  BROKI INMOBILIARIA — PHP API Config
//
//  SETUP EN HOSTINGER (solo una vez):
//  1. En hPanel → Administrador de Archivos → api/
//  2. Copia api/config.local.php.example → api/config.local.php
//  3. Edita config.local.php con tus credenciales reales de la DB
//  4. Guarda. Este archivo NO está en git → nunca se sobreescribirá.
// ═══════════════════════════════════════════════════

// Carga credenciales locales (no en git, no sobreescritas por auto-deploy)
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
} else {
    // Placeholders — reemplazar en config.local.php en Hostinger
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'u123456789_broki');     // ← tu nombre de base de datos
    define('DB_USER', 'u123456789_broki');     // ← tu usuario de base de datos
    define('DB_PASS', 'your_strong_password'); // ← tu contraseña
}

define('UPLOADS_DIR', dirname(__DIR__) . '/uploads');
define('UPLOADS_URL', '/uploads');
define('MAX_UPLOAD_BYTES', 10 * 1024 * 1024); // 10 MB

// ── Session ──────────────────────────────────────────
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
session_start();

// ── Headers ──────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['https://brokirealstate.com', 'https://www.brokirealstate.com', 'http://localhost:5173'];
if (in_array($origin, $allowed, true) || str_contains($origin, 'replit.dev')) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ── PDO connection ────────────────────────────────────
function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;
    try {
        $pdo = new PDO(
            sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME),
            DB_USER, DB_PASS,
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
        init_tables($pdo);
    } catch (PDOException $e) {
        json_error('DB connection failed: ' . $e->getMessage(), 500);
    }
    return $pdo;
}

// ── Auto-create tables + seed ─────────────────────────
function init_tables(PDO $pdo): void {
    $pdo->exec("CREATE TABLE IF NOT EXISTS admin_users (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        username      VARCHAR(50)  NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        last_login    DATETIME,
        last_changed  DATETIME,
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        `key`      VARCHAR(100) PRIMARY KEY,
        value      LONGTEXT     NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS properties (
        id          VARCHAR(20)  PRIMARY KEY,
        name        VARCHAR(200) NOT NULL,
        location    VARCHAR(200) NOT NULL DEFAULT '',
        price       BIGINT       NOT NULL DEFAULT 0,
        area        INT          NOT NULL DEFAULT 0,
        bedrooms    INT          NOT NULL DEFAULT 1,
        bathrooms   INT          NOT NULL DEFAULT 1,
        description TEXT,
        images      LONGTEXT,
        category    ENUM('economico','medio','premium') NOT NULL DEFAULT 'medio',
        available   TINYINT(1)   NOT NULL DEFAULT 1,
        created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS uploads (
        id         VARCHAR(20)  PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        type       ENUM('image','audio','hero_bg') NOT NULL,
        mime_type  VARCHAR(100),
        path       VARCHAR(500) NOT NULL,
        url        VARCHAR(500) NOT NULL,
        size       INT          DEFAULT 0,
        created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_type (type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS activity_log (
        id         VARCHAR(20)  PRIMARY KEY,
        action     VARCHAR(200) NOT NULL,
        details    TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Seed admin (broki / 1111)
    $exists = $pdo->query("SELECT id FROM admin_users WHERE username = 'broki'")->fetch();
    if (!$exists) {
        $hash = password_hash('1111', PASSWORD_BCRYPT, ['cost' => 12]);
        $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)")
            ->execute(['broki', $hash]);
    }

    // Seed default settings
    $defaults = [
        'site_content' => [
            'heroTitle'          => 'Broki Inmobiliaria',
            'heroSubtitle'       => 'Espacios que definen tu estilo de vida.',
            'heroCta'            => 'Ver Apartamentos',
            'heroCtaSecondary'   => 'Contáctanos',
            'contactPhone'       => '3507081756',
            'contactEmail'       => 'broki.inmobiliaria@gmail.com',
            'contactWhatsapp'    => '573507081756',
        ],
        'whatsapp' => [
            'number'      => '573507081756',
            'message'     => 'Hola, estoy interesado en conocer más sobre sus apartamentos disponibles.',
            'buttonText'  => 'Escríbenos',
        ],
        'pricing' => [
            ['id' => 'economico', 'name' => 'Estándar',  'priceRange' => 'Desde $350M COP', 'features' => ['Diseño Funcional', 'Ubicación Estratégica', '1-2 Habitaciones']],
            ['id' => 'medio',     'name' => 'Avanzado',  'priceRange' => 'Desde $600M COP', 'features' => ['Acabados Premium', 'Domótica Básica', 'Vistas Panorámicas']],
            ['id' => 'premium',   'name' => 'Signature', 'priceRange' => 'Desde $900M COP', 'features' => ['Arquitectura de Autor', 'Materiales Importados', 'Servicios Exclusivos']],
        ],
        'gallery'         => [],
        'hero_bg'         => null,
        'active_track'    => null,
        'audiovisual_svc' => [
            'visible'        => true,
            'title'          => 'Producción Audiovisual para Venta de Inmuebles',
            'description'    => 'Potenciamos la venta de inmuebles mediante contenido audiovisual profesional.',
            'includes'       => ['2 videos de alta calidad', 'Tomas aéreas con dron', '20 fotografías profesionales en alta calidad', 'Material para inventarios y promoción', 'Ficha técnica del inmueble'],
            'price'          => '$600.000 COP',
            'commission'     => '2.8% sobre el valor final de venta',
            'benefit'        => 'El valor invertido en el trabajo audiovisual será devuelto al concretarse la venta con nosotros.',
            'ownershipNote'  => 'El propietario conserva todo el contenido realizado y puede utilizarlo libremente.',
            'noExclusivity'  => true,
        ],
        'brokerage_svc' => [
            'visible'             => true,
            'title'               => 'Corretaje y Administración de Arrendamientos',
            'description'         => 'Trabajamos bajo modalidad de corretaje con respaldo de aseguradoras reconocidas.',
            'firstMonthCovers'    => ['Comisión inmobiliaria', 'Estudio de perfiles', 'Póliza de arrendamiento', 'Gestión documental'],
            'fromSecondMonthNote' => 'El propietario recibe el 100% del canon mensual sin descuentos adicionales.',
            'benefits'            => ['Filtro de clientes calificados', 'Proceso ágil de colocación', 'Respaldo jurídico durante la vigencia del contrato', 'Respaldo financiero mediante póliza de arrendamiento', 'Seguimiento permanente al inmueble', 'Acompañamiento profesional durante todo el proceso'],
        ],
    ];
    foreach ($defaults as $key => $val) {
        $row = $pdo->prepare("SELECT `key` FROM settings WHERE `key` = ?");
        $row->execute([$key]);
        if (!$row->fetch()) {
            $pdo->prepare("INSERT INTO settings (`key`, value) VALUES (?, ?)")
                ->execute([$key, json_encode($val, JSON_UNESCAPED_UNICODE)]);
        }
    }

    // Seed demo properties
    $cnt = (int)$pdo->query("SELECT COUNT(*) FROM properties")->fetchColumn();
    if ($cnt === 0) {
        $demos = [
            ['id' => 'p1', 'name' => 'OASIS CONCRETO', 'location' => 'El Poblado, Medellín',  'price' => 850000000, 'area' => 120, 'bedrooms' => 2, 'bathrooms' => 2, 'description' => 'Apartamento de diseño brutalista con acabados en concreto expuesto y domótica avanzada.', 'images' => '["/images/demo-apt-1.png"]', 'category' => 'premium'],
            ['id' => 'p2', 'name' => 'NOIR LOFT',       'location' => 'Chapinero, Medellín',   'price' => 620000000, 'area' => 85,  'bedrooms' => 1, 'bathrooms' => 1, 'description' => 'Loft de concepto abierto con tonos oscuros y luz tenue.',                              'images' => '["/images/demo-apt-2.png"]', 'category' => 'medio'],
            ['id' => 'p3', 'name' => 'ESTUDIO ZERO',    'location' => 'Laureles, Bogotá',       'price' => 450000000, 'area' => 60,  'bedrooms' => 1, 'bathrooms' => 1, 'description' => 'Espacio minimalista funcional. Diseñado para maximizar la entrada de luz natural.',     'images' => '["/images/demo-apt-3.png"]', 'category' => 'economico'],
        ];
        $stmt = $pdo->prepare("INSERT INTO properties (id,name,location,price,area,bedrooms,bathrooms,description,images,category) VALUES (?,?,?,?,?,?,?,?,?,?)");
        foreach ($demos as $d) {
            $stmt->execute([$d['id'], $d['name'], $d['location'], $d['price'], $d['area'], $d['bedrooms'], $d['bathrooms'], $d['description'], $d['images'], $d['category']]);
        }
    }
}

// ── Helpers ───────────────────────────────────────────
function json_ok(mixed $data = null): never {
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit();
}

function json_error(string $msg, int $code = 400): never {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit();
}

function require_auth(): void {
    if (empty($_SESSION['admin_id'])) json_error('No autorizado', 401);
}

function is_auth(): bool {
    return !empty($_SESSION['admin_id']);
}

function get_body(): array {
    static $body = null;
    if ($body !== null) return $body;
    $raw = file_get_contents('php://input');
    $body = json_decode($raw ?? '', true) ?? [];
    return $body;
}

function rand_id(): string {
    return bin2hex(random_bytes(4));
}

function ensure_upload_dirs(): void {
    foreach (['images', 'audio'] as $sub) {
        $dir = UPLOADS_DIR . '/' . $sub;
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
}
