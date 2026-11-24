import { useState } from 'react';
import { ROLES, rolesCreables, puedeCrearUsuarios } from './politicaCreacion';
import { crearUsuario } from './crearUsuarioApi';

const estiloCampo = {
  display: 'grid',
  gap: 6,
  fontWeight: 600,
  fontSize: 14,
};

const estiloInput = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  fontSize: 15,
};

export default function CrearUsuarioPage({ rolActual, token, ambito = {} }) {
  const opciones = rolesCreables(rolActual);
  const [form, setForm] = useState({
    correo: '',
    nombre: '',
    contrasena: '',
    rol: opciones[0] ?? '',
    rutaTerritorial: ambito.rutaTerritorial ?? '',
    bancoId: ambito.bancoId ?? '',
  });
  const [estado, setEstado] = useState({ cargando: false, error: null, ok: null });

  if (!puedeCrearUsuarios(rolActual)) return null;

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setEstado({ cargando: true, error: null, ok: null });
    try {
      await crearUsuario(form, token);
      setEstado({ cargando: false, error: null, ok: `Cuenta ${form.correo} creada correctamente.` });
      setForm({ ...form, correo: '', nombre: '', contrasena: '' });
    } catch (err) {
      setEstado({ cargando: false, error: err.message, ok: null });
    }
  }

  return (
    <form onSubmit={enviar} style={{ display: 'grid', gap: 16, maxWidth: 460, padding: '24px 0' }}>
      <h2 style={{ margin: 0 }}>Crear usuario institucional</h2>
      <label style={estiloCampo}>
        Correo electrónico
        <input style={estiloInput} type="email" required placeholder="usuario@redvital.test" value={form.correo} onChange={cambiar('correo')} />
      </label>
      <label style={estiloCampo}>
        Nombre completo
        <input style={estiloInput} required placeholder="Nombre y apellido" value={form.nombre} onChange={cambiar('nombre')} />
      </label>
      <label style={estiloCampo}>
        Rol
        <select style={estiloInput} value={form.rol} onChange={cambiar('rol')}>
          {opciones.map((r) => <option key={r} value={r}>{ROLES[r]}</option>)}
        </select>
      </label>
      {form.rol === 'U5' && (
        <label style={estiloCampo}>
          Ruta territorial (código DIVIPOLA, ej. 05 o 05.05001)
          <input
            style={estiloInput}
            required
            placeholder="05"
            disabled={rolActual === 'U5'}
            value={form.rutaTerritorial}
            onChange={cambiar('rutaTerritorial')}
          />
        </label>
      )}
      {(form.rol === 'U3' || form.rol === 'U4') && (
        <label style={estiloCampo}>
          ID del Banco de Sangre (UUID de Instituciones)
          <input
            style={estiloInput}
            required
            placeholder="00000000-0000-0000-0000-000000000000"
            disabled={rolActual === 'U4'}
            value={form.bancoId}
            onChange={cambiar('bancoId')}
          />
        </label>
      )}
      <label style={estiloCampo}>
        Contraseña (mín. 12 caracteres)
        <input style={estiloInput} type="password" required minLength={12} value={form.contrasena} onChange={cambiar('contrasena')} />
      </label>
      <button
        disabled={estado.cargando}
        style={{
          padding: '12px 16px',
          borderRadius: 8,
          border: 'none',
          background: '#8f1d2c',
          color: '#ffffff',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {estado.cargando ? 'Creando…' : 'Crear usuario'}
      </button>
      {estado.error && <p role="alert" style={{ color: '#b91c1c', fontWeight: 600 }}>{estado.error}</p>}
      {estado.ok && <p role="status" style={{ color: '#15803d', fontWeight: 600 }}>{estado.ok}</p>}
    </form>
  );
}
