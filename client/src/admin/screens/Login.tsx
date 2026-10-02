import { useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { sendJson } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { AdminUser, SiteSettings } from '../../types';
import { ThemeToggle } from '../../theme/ThemeToggle';
import { BrandLogo } from '../../theme/BrandLogo';

export function Login({ onLogin, brand }: { onLogin: (user: AdminUser) => void; brand: SiteSettings | null }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try { const user = await sendJson<AdminUser>('/admin/login', 'POST', { email, password }); onLogin(user); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Sign in failed.'); }
    finally { setBusy(false); }
  };
  return <main className="cms-login-wrap">
    <div className="cms-login-shell">
      <form className="cms-login" onSubmit={submit}>
        <ThemeToggle className="cms-login-theme-toggle" />
        <BrandLogo className="cms-login-logo" lightPath={brand?.logoPath} darkPath={brand?.darkLogoPath} alt={brand?.brandName || 'HornSphere Consulting'} />
        <div className="cms-login-intro"><h1>Sign in</h1><p>Enter your admin credentials to continue.</p></div>
        <div className="cms-login-fields">
          <label htmlFor="admin-email">Email address</label>
          <Input id="admin-email" type="email" autoComplete="username" required placeholder="name@example.com" value={email} onChange={event => setEmail(event.target.value)} />
          <label htmlFor="admin-password">Password</label>
          <div className="cms-password-field">
            <Input id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required placeholder="Enter your password" value={password} onChange={event => setPassword(event.target.value)} />
            <button type="button" className="cms-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(current => !current)}>
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {message && <p className="cms-alert" role="alert">{message}</p>}
        <Button type="submit" disabled={busy} size="lg">{busy ? 'Signing in…' : <>Sign in <ArrowRight size={17} aria-hidden="true" /></>}</Button>
      </form>
    </div>
  </main>;
}
