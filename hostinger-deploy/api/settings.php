<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $key = $_GET['key'] ?? null;
    if (!$key) json_error('key requerido');

    $stmt = db()->prepare("SELECT value FROM settings WHERE `key` = ?");
    $stmt->execute([$key]);
    $row = $stmt->fetch();

    if (!$row) {
        json_ok(null);
        return;
    }

    $value = json_decode($row['value'], true);
    json_ok($value);
}

if ($method === 'POST') {
    // Writes require auth
    require_auth();

    $body  = get_body();
    $key   = $body['key']   ?? null;
    $value = $body['value'] ?? null;

    if (!$key) json_error('key requerido');

    $encoded = json_encode($value, JSON_UNESCAPED_UNICODE);

    $stmt = db()->prepare(
        "INSERT INTO settings (`key`, value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()"
    );
    $stmt->execute([$key, $encoded]);

    json_ok(null);
}

json_error('Método no permitido', 405);
