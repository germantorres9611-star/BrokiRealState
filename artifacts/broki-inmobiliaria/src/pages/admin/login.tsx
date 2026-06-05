import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Input, Button, Label } from '../../components/ui-custom';
import { motion } from 'framer-motion';
import {
  hashPassword, initAdminCreds, getAdminCreds,
  isLockedOut, recordFailedAttempt, clearLoginAttempts, remainingAttempts
} from '../../lib/security';
import { logActivity } from '../../lib/storage-adapter';
import { isApiMode, apiLogin } from '../../lib/storage-adapter';
import { ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [lockInfo, setLockInfo] = useState({ locked: false, remainingMs: 0 });
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!isApiMode()) initAdminCreds();
    if (localStorage.getItem('broki_auth')) setLocation('/admin');
    const lock = isLockedOut();
    setLockInfo(lock);
  }, [setLocation]);

  useEffect(() => {
    if (!lockInfo.locked) return;
    const interval = setInterval(() => {
      const lock = isLockedOut();
      setLockInfo(lock);
      if (!lock.locked) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockInfo.locked]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const lock = isLockedOut();
    if (lock.locked) { setLockInfo(lock); return; }
    if (!username.trim() || !password.trim()) { setError('Completa todos los campos'); return; }

    setLoading(true);
    try {
      // ── API mode (Hostinger): send to PHP ──────────────
      if (isApiMode()) {
        const result = await apiLogin(username.trim(), password);
        if (result.ok) {
          clearLoginAttempts();
          logActivity('Inicio de sesión', `Usuario: ${username.trim()}`);
          setLocation('/admin');
        } else {
          const attempts = recordFailedAttempt();
          const remaining = Math.max(0, 5 - attempts.count);
          if (attempts.lockedUntil > 0) {
            setLockInfo({ locked: true, remainingMs: attempts.lockedUntil - Date.now() });
            setError('Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos.');
          } else {
            setError(`Credenciales inválidas. ${remaining} intento${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.`);
          }
        }
        return;
      }

      // ── localStorage mode (Replit dev): SHA-256 local ──
      await initAdminCreds();
      const creds     = getAdminCreds();
      const inputHash = await hashPassword(password);
      const validUser = creds ? creds.username : 'broki';
      const validHash = creds?.passwordHash;

      if (username === validUser && inputHash === validHash) {
        clearLoginAttempts();
        localStorage.setItem('broki_auth', 'true');
        logActivity('Inicio de sesión', `Usuario: ${username}`);
        setLocation('/admin');
      } else {
        const attempts = recordFailedAttempt();
        const remaining = Math.max(0, 5 - attempts.count);
        if (attempts.lockedUntil > 0) {
          setLockInfo({ locked: true, remainingMs: attempts.lockedUntil - Date.now() });
          setError('Demasiados intentos fallidos. Cuenta bloqueada por 5 minutos.');
        } else {
          setError(`Credenciales inválidas. ${remaining} intento${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const lockMinutes = Math.ceil(lockInfo.remainingMs / 60000);
  const lockSeconds = Math.ceil((lockInfo.remainingMs % 60000) / 1000);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_50%)] blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-card border border-border relative z-10 glass-card"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold mb-2">BROKI ADMIN</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-xs">Acceso Restringido</p>
        </div>

        {lockInfo.locked ? (
          <div className="text-center py-8 space-y-4">
            <ShieldAlert size={48} className="mx-auto text-destructive" />
            <div className="p-4 bg-destructive/10 border border-destructive text-destructive">
              <p className="font-bold uppercase tracking-wider text-sm mb-1">Cuenta bloqueada</p>
              <p className="text-sm">Demasiados intentos fallidos.</p>
              <p className="text-xl font-mono font-bold mt-2">
                {lockMinutes}:{lockSeconds.toString().padStart(2, '0')}
              </p>
              <p className="text-xs mt-1">Intenta de nuevo en {lockMinutes} minuto{lockMinutes !== 1 ? 's' : ''}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm text-center font-bold uppercase">
                {error}
              </div>
            )}
            <div>
              <Label>Usuario</Label>
              <Input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="broki" autoComplete="username" />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••" autoComplete="current-password" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Intentos restantes: {remainingAttempts()}</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verificando...' : 'Ingresar al Sistema'}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
