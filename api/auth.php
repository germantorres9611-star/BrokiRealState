<?php
declare(strict_types=1);
require_once __DIR__ . '/config.php';

$action = get_body()['action'] ?? ($_GET['action'] ?? '');

switch ($action) {

    // ── Login ────────────────────────────────────────
    case 'login':
        $body     = get_body();
        $username = trim($body['username'] ?? '');
        $password = $body['password'] ?? '';

        if (!$username || !$password) json_error('Credenciales requeridas');

        $stmt = db()->prepare("SELECT id, username, password_hash FROM admin_users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            json_error('Credenciales inválidas', 401);
        }

        // Update last_login
        db()->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);

        // Store session
        $_SESSION['admin_id']       = $user['id'];
        $_SESSION['admin_username'] = $user['username'];

        // Activity log
        db()->prepare("INSERT INTO activity_log (id, action, details) VALUES (?, ?, ?)")
            ->execute([rand_id(), 'Inicio de sesión', "Usuario: {$user['username']}"]);

        json_ok(['username' => $user['username']]);

    // ── Logout ───────────────────────────────────────
    case 'logout':
        session_destroy();
        json_ok(null);

    // ── Auth status ──────────────────────────────────
    case 'status':
        json_ok(['authenticated' => is_auth(), 'username' => $_SESSION['admin_username'] ?? null]);

    // ── Change password ──────────────────────────────
    case 'change_password':
        require_auth();
        $body        = get_body();
        $current     = $body['current'] ?? '';
        $newPassword = $body['new_password'] ?? '';

        if (!$current || !$newPassword) json_error('Completa todos los campos');
        if (strlen($newPassword) < 4)   json_error('Mínimo 4 caracteres');

        $stmt = db()->prepare("SELECT password_hash FROM admin_users WHERE id = ?");
        $stmt->execute([$_SESSION['admin_id']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($current, $user['password_hash'])) {
            json_error('Contraseña actual incorrecta');
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        db()->prepare("UPDATE admin_users SET password_hash = ?, last_changed = NOW() WHERE id = ?")
            ->execute([$newHash, $_SESSION['admin_id']]);

        db()->prepare("INSERT INTO activity_log (id, action, details) VALUES (?, ?, ?)")
            ->execute([rand_id(), 'Contraseña cambiada', 'Nueva contraseña guardada (bcrypt)']);

        json_ok(null);

    default:
        json_error('Acción desconocida');
}
