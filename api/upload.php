<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── List uploads by type ──────────────────────────────
if ($method === 'GET') {
    $type = $_GET['type'] ?? 'image';
    if (!in_array($type, ['image', 'audio', 'hero_bg'], true)) {
        json_error('type inválido');
    }

    $stmt = db()->prepare(
        "SELECT id, name, type, url AS data, mime_type,
                DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%sZ') AS createdAt
         FROM uploads WHERE type = ? ORDER BY created_at DESC"
    );
    $stmt->execute([$type]);
    json_ok($stmt->fetchAll());
}

// ── Upload new file ───────────────────────────────────
if ($method === 'POST') {

    // JSON action (delete)
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($contentType, 'application/json')) {
        require_auth();
        $body   = get_body();
        $action = $body['action'] ?? '';

        if ($action === 'delete') {
            $id = $body['id'] ?? '';
            if (!$id) json_error('id requerido');

            $stmt = db()->prepare("SELECT path, name FROM uploads WHERE id = ?");
            $stmt->execute([$id]);
            $upload = $stmt->fetch();

            if ($upload) {
                if (file_exists($upload['path'])) {
                    unlink($upload['path']);
                }
                db()->prepare("DELETE FROM uploads WHERE id = ?")->execute([$id]);
                db()->prepare("INSERT INTO activity_log (id, action, details) VALUES (?, ?, ?)")
                    ->execute([rand_id(), 'Archivo eliminado', $upload['name']]);
            }
            json_ok(null);
        }

        json_error('Acción desconocida');
    }

    // Multipart file upload
    require_auth();
    ensure_upload_dirs();

    if (empty($_FILES['file'])) json_error('Archivo requerido');

    $file    = $_FILES['file'];
    $type    = $_POST['type'] ?? 'image';

    if ($file['error'] !== UPLOAD_ERR_OK) {
        json_error('Error al subir: código ' . $file['error']);
    }
    if ($file['size'] > MAX_UPLOAD_BYTES) {
        json_error('Archivo demasiado grande (máximo 10MB)');
    }

    // Validate MIME type
    $finfo    = finfo_open(FILEINFO_MIME_TYPE);
    $mimeReal = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $allowedAudio  = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-wav'];

    if (in_array($type, ['image', 'hero_bg'], true)) {
        if (!in_array($mimeReal, $allowedImages, true)) {
            json_error('Formato de imagen no permitido. Use JPG, PNG o WEBP.');
        }
        $subdir   = 'images';
        $ext      = match ($mimeReal) {
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
            default      => 'jpg',
        };
    } else {
        if (!in_array($mimeReal, $allowedAudio, true)) {
            json_error('Formato de audio no permitido. Use MP3, WAV u OGG.');
        }
        $subdir = 'audio';
        $ext    = match ($mimeReal) {
            'audio/mpeg', 'audio/mp3' => 'mp3',
            'audio/wav', 'audio/x-wav' => 'wav',
            'audio/ogg' => 'ogg',
            default => 'mp3',
        };
    }

    $id       = rand_id();
    $filename = $id . '.' . $ext;
    $path     = UPLOADS_DIR . '/' . $subdir . '/' . $filename;
    $url      = UPLOADS_URL . '/' . $subdir . '/' . $filename;
    $origName = preg_replace('/[^a-zA-Z0-9._\- ]/', '', $file['name']);

    if (!move_uploaded_file($file['tmp_name'], $path)) {
        json_error('No se pudo guardar el archivo. Verifica los permisos de /uploads/.');
    }
    chmod($path, 0644);

    // Save to DB
    db()->prepare(
        "INSERT INTO uploads (id, name, type, mime_type, path, url, size) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )->execute([$id, $origName, $type, $mimeReal, $path, $url, $file['size']]);

    db()->prepare("INSERT INTO activity_log (id, action, details) VALUES (?, ?, ?)")
        ->execute([rand_id(), $type === 'audio' ? 'Audio subido' : 'Imagen subida', $origName]);

    json_ok([
        'id'        => $id,
        'name'      => $origName,
        'type'      => $type,
        'url'       => $url,
        'data'      => $url,   // 'data' field mirrors AudioTrack/UploadedFile shape
        'mime_type' => $mimeReal,
        'createdAt' => date('Y-m-d\TH:i:s\Z'),
    ]);
}

json_error('Método no permitido', 405);
