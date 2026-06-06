<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── Helpers ────────────────────────────────────────────
function get_active_id(): ?string {
    $stmt = db()->prepare("SELECT value FROM settings WHERE `key` = 'active_track'");
    $stmt->execute();
    $row = $stmt->fetch();
    return $row ? json_decode($row['value'], true) : null;
}

// ── GET ────────────────────────────────────────────────
if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action === 'active_id') {
        json_ok(get_active_id());
    }

    // Return all tracks (audio uploads)
    $stmt = db()->prepare(
        "SELECT id, name, type, mime_type,
                url AS data,
                DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') AS createdAt
         FROM uploads WHERE type = 'audio' ORDER BY created_at DESC"
    );
    $stmt->execute();
    $tracks = $stmt->fetchAll();

    // Add format from mime_type
    foreach ($tracks as &$t) {
        $t['format'] = match($t['mime_type']) {
            'audio/mpeg', 'audio/mp3' => 'mp3',
            'audio/wav', 'audio/x-wav' => 'wav',
            'audio/ogg' => 'ogg',
            default => 'mp3',
        };
    }
    json_ok($tracks);
}

// ── POST ───────────────────────────────────────────────
if ($method === 'POST') {
    require_auth();

    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    // JSON actions: delete, set_active
    if (str_contains($contentType, 'application/json')) {
        $body   = get_body();
        $action = $body['action'] ?? '';

        if ($action === 'delete') {
            $id = $body['id'] ?? '';
            if (!$id) json_error('id requerido');

            $stmt = db()->prepare("SELECT path, name FROM uploads WHERE id = ? AND type = 'audio'");
            $stmt->execute([$id]);
            $upload = $stmt->fetch();

            if ($upload) {
                if (file_exists($upload['path'])) unlink($upload['path']);
                db()->prepare("DELETE FROM uploads WHERE id = ?")->execute([$id]);

                // If this was the active track, pick the next one
                $activeId = get_active_id();
                if ($activeId === $id) {
                    $next = db()->query(
                        "SELECT id FROM uploads WHERE type='audio' ORDER BY created_at DESC LIMIT 1"
                    )->fetch();
                    $newActive = $next ? $next['id'] : null;
                    db()->prepare(
                        "INSERT INTO settings (`key`, value) VALUES ('active_track', ?)
                         ON DUPLICATE KEY UPDATE value = VALUES(value)"
                    )->execute([json_encode($newActive)]);
                }

                db()->prepare("INSERT INTO activity_log (id, action, details) VALUES (?, ?, ?)")
                    ->execute([rand_id(), 'Canción eliminada', $upload['name']]);
            }
            json_ok(null);
        }

        if ($action === 'set_active') {
            $id = $body['id'] ?? null;
            db()->prepare(
                "INSERT INTO settings (`key`, value) VALUES ('active_track', ?)
                 ON DUPLICATE KEY UPDATE value = VALUES(value)"
            )->execute([json_encode($id)]);

            if ($id) {
                $track = db()->prepare("SELECT name FROM uploads WHERE id = ?");
                $track->execute([$id]);
                $t = $track->fetch();
                if ($t) {
                    db()->prepare("INSERT INTO activity_log (id, action, details) VALUES (?, ?, ?)")
                        ->execute([rand_id(), 'Canción activa cambiada', $t['name']]);
                }
            }
            json_ok(null);
        }

        json_error('Acción desconocida');
    }

    // Multipart: upload new track
    ensure_upload_dirs();

    if (empty($_FILES['file'])) json_error('Archivo requerido');

    $file    = $_FILES['file'];
    $name    = trim($_POST['name'] ?? $file['name']);

    if ($file['error'] !== UPLOAD_ERR_OK) json_error('Error al subir: ' . $file['error']);
    if ($file['size'] > MAX_UPLOAD_BYTES)  json_error('Archivo demasiado grande (máximo 10MB)');

    $finfo    = finfo_open(FILEINFO_MIME_TYPE);
    $mimeReal = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg'];
    if (!in_array($mimeReal, $allowed, true)) {
        json_error('Formato no permitido. Use MP3, WAV u OGG.');
    }

    $ext = match($mimeReal) {
        'audio/mpeg', 'audio/mp3' => 'mp3',
        'audio/wav', 'audio/x-wav' => 'wav',
        'audio/ogg' => 'ogg',
        default => 'mp3',
    };
    $format = $ext;

    $id       = rand_id();
    $filename = $id . '.' . $ext;
    $path     = UPLOADS_DIR . '/audio/' . $filename;
    $url      = UPLOADS_URL . '/audio/' . $filename;
    $origName = preg_replace('/[^a-zA-Z0-9._\- ]/', '', $file['name']);

    if (!move_uploaded_file($file['tmp_name'], $path)) {
        json_error('No se pudo guardar. Verifica permisos de /uploads/audio/');
    }
    chmod($path, 0644);

    db()->prepare(
        "INSERT INTO uploads (id, name, type, mime_type, path, url, size) VALUES (?, ?, 'audio', ?, ?, ?, ?)"
    )->execute([$id, $name ?: $origName, $mimeReal, $path, $url, $file['size']]);

    // Auto-activate if first track
    $count = (int)db()->query("SELECT COUNT(*) FROM uploads WHERE type='audio'")->fetchColumn();
    if ($count === 1) {
        db()->prepare(
            "INSERT INTO settings (`key`, value) VALUES ('active_track', ?)
             ON DUPLICATE KEY UPDATE value = VALUES(value)"
        )->execute([json_encode($id)]);
    }

    db()->prepare("INSERT INTO activity_log (id, action, details) VALUES (?, ?, ?)")
        ->execute([rand_id(), 'Canción subida', $name ?: $origName]);

    json_ok([
        'id'        => $id,
        'name'      => $name ?: $origName,
        'format'    => $format,
        'data'      => $url,
        'createdAt' => date('Y-m-d\TH:i:s\Z'),
    ]);
}

json_error('Método no permitido', 405);
