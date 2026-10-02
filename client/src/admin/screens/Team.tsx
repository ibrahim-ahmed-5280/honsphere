import { useEffect, useState } from 'react';
import { api, sendJson } from '../../api';
import type { AdminUser } from '../../types';
import { useConfirm } from '../ConfirmProvider';

export function Team() {
  const confirmAction = useConfirm();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'owner' | 'editor'>('editor');
  const [message, setMessage] = useState('');
  const refresh = () => api<AdminUser[]>('/admin/users').then(setUsers).catch(error => setMessage(error.message));
  useEffect(() => { void refresh(); }, []);
  const add = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage('');
    if (fullName.trim().length < 2) { setMessage('Enter a full name with at least 2 characters.'); return; }
    if (!await confirmAction({ title: 'Create this admin account?', description: `${fullName.trim()} (${email}) will receive ${role} access to the website workspace.`, confirmLabel: 'Create admin' })) return;
    try { await sendJson('/admin/users', 'POST', { fullName: fullName.trim(), email, password, role }); setFullName(''); setEmail(''); setPassword(''); setRole('editor'); setMessage('Admin created. Share the login details securely.'); await refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not create admin.'); }
  };
  const toggle = async (user: AdminUser) => {
    if (!await confirmAction({
      title: user.active ? 'Deactivate this admin?' : 'Reactivate this admin?',
      description: user.active ? `${user.email} will lose access to the admin workspace.` : `${user.email} will be able to sign in again.`,
      confirmLabel: user.active ? 'Deactivate admin' : 'Reactivate admin',
      destructive: Boolean(user.active),
    })) return;
    try { await sendJson(`/admin/users/${user._id}`, 'PATCH', { active: !user.active }); await refresh(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not update admin.'); }
  };
  return <div className="cms-form-page"><div className="cms-page-editor-head"><div><h1>Admin team</h1><p>Give editors access to manage content and enquiries.</p></div></div>{message && <p className="cms-notice">{message}</p>}
    <div className="cms-card"><h2>People with access</h2><div className="cms-team-list">{users.map(user => <div key={user._id}><span><strong>{user.fullName || user.email}</strong><small>{user.fullName && `${user.email} · `}{user.role} · {user.active ? 'Active' : 'Inactive'}</small></span><button type="button" onClick={() => void toggle(user)}>{user.active ? 'Deactivate' : 'Activate'}</button></div>)}</div></div>
    <form className="cms-card cms-team-form" onSubmit={add} autoComplete="off">
      <h2>Add an admin</h2>
      <div className="cms-two-cols">
        <label>Full name<input type="text" autoComplete="off" minLength={2} maxLength={120} required placeholder="Enter full name" value={fullName} onChange={event => setFullName(event.target.value)} /></label>
        <label>Email<input type="email" autoComplete="off" required placeholder="name@example.com" value={email} onChange={event => setEmail(event.target.value)} /></label>
        <label>Temporary password (12+ characters)<input type="password" autoComplete="new-password" minLength={12} required placeholder="Enter a temporary password" value={password} onChange={event => setPassword(event.target.value)} /></label>
        <label>Role<select value={role} onChange={event => setRole(event.target.value as 'owner' | 'editor')}><option value="editor">Editor</option><option value="owner">Owner</option></select></label>
      </div>
      <div className="cms-team-form-actions"><button className="cms-primary" type="submit">Create admin</button></div>
    </form>
  </div>;
}

