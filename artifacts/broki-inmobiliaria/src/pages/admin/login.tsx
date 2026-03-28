import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Input, Button, Label } from '../../components/ui-custom';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'broki' && password === '1111') {
      localStorage.setItem('broki_auth', 'true');
      setLocation('/admin');
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary)_0%,transparent_50%)] blur-[100px]" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-card border border-border relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-white mb-2">BROKI ADMIN</h1>
          <p className="text-muted-foreground uppercase tracking-widest text-xs">Acceso Restringido</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm text-center font-bold uppercase">{error}</div>}
          
          <div>
            <Label>Usuario</Label>
            <Input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="broki"
            />
          </div>
          
          <div>
            <Label>Contraseña</Label>
            <Input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••"
            />
          </div>

          <Button type="submit" className="w-full mt-8">
            Ingresar al Sistema
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
