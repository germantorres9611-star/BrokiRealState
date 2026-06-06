<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    require_auth();
    $stmt = db()->query(
        "SELECT id, action, details,
                DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') AS timestamp
         FROM activity_log ORDER BY created_at DESC LIMIT 100"
    );
    json_ok($stmt->fetchAll());
}

if ($method === 'POST') {
    $body    = get_body();
    $action  = $body['action']  ?? '';
    $details = $body['details'] ?? '';

    if (!$action) json_error('action requerido');

    db()->prepare("INSERT INTO activity_log (id, action, details) VALUES (?, ?, ?)")
        ->execute([rand_id(), $action, $details]);

    json_ok(null);
}

json_error('Método no permitido', 405);
