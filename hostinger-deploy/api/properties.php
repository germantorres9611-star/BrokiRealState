<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── List all properties ───────────────────────────────
if ($method === 'GET') {
    $stmt = db()->query(
        "SELECT id, name, location, price, area, bedrooms, bathrooms,
                description, images, category, available,
                DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') AS createdAt
         FROM properties ORDER BY created_at DESC"
    );
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row['images']    = json_decode($row['images'] ?? '[]', true) ?? [];
        $row['price']     = (int)$row['price'];
        $row['area']      = (int)$row['area'];
        $row['bedrooms']  = (int)$row['bedrooms'];
        $row['bathrooms'] = (int)$row['bathrooms'];
        $row['available'] = (bool)$row['available'];
    }
    json_ok($rows);
}

if ($method === 'POST') {
    require_auth();
    $body   = get_body();
    $action = $body['action'] ?? 'create';

    // ── Create ────────────────────────────────────────
    if ($action === 'create') {
        $d = $body['data'] ?? [];
        $id = rand_id();
        $stmt = db()->prepare(
            "INSERT INTO properties
             (id, name, location, price, area, bedrooms, bathrooms, description, images, category, available)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $id,
            $d['name']        ?? '',
            $d['location']    ?? '',
            (int)($d['price']     ?? 0),
            (int)($d['area']      ?? 0),
            (int)($d['bedrooms']  ?? 1),
            (int)($d['bathrooms'] ?? 1),
            $d['description'] ?? '',
            json_encode($d['images'] ?? [], JSON_UNESCAPED_UNICODE),
            $d['category']    ?? 'medio',
            isset($d['available']) ? (int)(bool)$d['available'] : 1,
        ]);

        db()->prepare("INSERT INTO activity_log (id, action, details) VALUES (?, ?, ?)")
            ->execute([rand_id(), 'Propiedad creada', "\"{$d['name']}\" en " . ($d['location'] ?? '')]);

        // Return the created property
        $prop = db()->prepare("SELECT * FROM properties WHERE id = ?")->execute([$id]);
        json_ok(array_merge($d, ['id' => $id, 'createdAt' => date('Y-m-d\TH:i:s\Z')]));
    }

    // ── Update ────────────────────────────────────────
    if ($action === 'update') {
        $d = $body['data'] ?? [];
        if (empty($d['id'])) json_error('id requerido');

        $stmt = db()->prepare(
            "UPDATE properties SET
             name = ?, location = ?, price = ?, area = ?,
             bedrooms = ?, bathrooms = ?, description = ?,
             images = ?, category = ?, available = ?
             WHERE id = ?"
        );
        $stmt->execute([
            $d['name']        ?? '',
            $d['location']    ?? '',
            (int)($d['price']     ?? 0),
            (int)($d['area']      ?? 0),
            (int)($d['bedrooms']  ?? 1),
            (int)($d['bathrooms'] ?? 1),
            $d['description'] ?? '',
            json_encode($d['images'] ?? [], JSON_UNESCAPED_UNICODE),
            $d['category']    ?? 'medio',
            isset($d['available']) ? (int)(bool)$d['available'] : 1,
            $d['id'],
        ]);

        db()->prepare("INSERT INTO activity_log (id, action, details) VALUES (?, ?, ?)")
            ->execute([rand_id(), 'Propiedad editada', "\"{$d['name']}\""]);

        json_ok($d);
    }

    // ── Delete ────────────────────────────────────────
    if ($action === 'delete') {
        $id = $body['id'] ?? '';
        if (!$id) json_error('id requerido');

        $row = db()->prepare("SELECT name FROM properties WHERE id = ?");
        $row->execute([$id]);
        $prop = $row->fetch();

        db()->prepare("DELETE FROM properties WHERE id = ?")->execute([$id]);

        db()->prepare("INSERT INTO activity_log (id, action, details) VALUES (?, ?, ?)")
            ->execute([rand_id(), 'Propiedad eliminada', $prop ? "\"{$prop['name']}\"" : $id]);

        json_ok(null);
    }

    json_error('Acción desconocida');
}

json_error('Método no permitido', 405);
