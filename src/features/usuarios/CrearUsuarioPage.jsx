import { useState } from 'react';
import { ROLES, rolesCreables, puedeCrearUsuarios } from './politicaCreacion';
import { crearUsuario } from './crearUsuarioApi';

// Props: rolActual ('U4'|'U5'|'U6'|...), token (JWT), y opcionalmente el ámbito del usuario actual.
export default function CrearUsuarioPage({ rolActual, token, ambito = {} }) {
  const opciones = rolesCreables(rolActual);
  const [form, setForm] = useState({
    correo: '', nombre: '', contrasena: '', rol: opciones[0] ?? '',
    rutaTerritorial: ambito.rutaTerritorial ?? '', bancoId: ambito.bancoId ?? '',
  });
  const [estado, setEstado] = useState({ cargando: false, error: null, ok: null });

  if (!puedeCrearUsuarios(rolActual)) return null; // el rol ni ve la entrada

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setEstado({ cargando: true, error: null, ok: null });
    try {
      await crearUsuario(form, token);
      setEstado({ cargando: false, error: null, ok: `Cuenta ${form.correo} creada.` });
      setForm({ ...form, correo: '', nombre: '', contrasena: '' });
    } catch (err) {
      setEstado({ cargando: false, error: err.message, ok: null });
    }
  }

  return (
    <form onSubmit={enviar} style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      <h2>Crear usuario</h2>
      <label>Correo <input type="email" required value={form.correo} onChange={cambiar('correo')} /></label>
      <label>Nombre <input required value={form.nombre} onChange={cambiar('nombre')} /></label>
      <label>Rol
        <select value={form.rol} onChange={cambiar('rol')}>
          {opciones.map((r) => <option key={r} value={r}>{ROLES[r]}</option>)}
        </select>
      </label>
      {(form.rol === 'U5' || rolActual === 'U6' || rolActual === 'U5') && (
        <label>Ruta territorial (DIVIPOLA)
          <input value={form.rutaTerritorial} onChange={cambiar('rutaTerritorial')} />
        </label>
      )}
      {(form.rol === 'U3' || form.rol === 'U4') && (
        <label>Banco (id) <input value={form.bancoId} onChange={cambiar('bancoId')} /></label>
      )}
      <label>Contraseña (mín. 12 caracteres)
        <input type="password" required minLength={12} value={form.contrasena} onChange={cambiar('contrasena')} />
      </label>
      <button disabled={estado.cargando}>{estado.cargando ? 'Creando…' : 'Crear usuario'}</button>
      {estado.error && <p role="alert">{estado.error}</p>}
      {estado.ok && <p role="status">{estado.ok}</p>}
    </form>
  );
}
