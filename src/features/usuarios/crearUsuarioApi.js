// Ajusta API_BASE y la obtención del token a lo que ya usa tu frontend.
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export async function crearUsuario(datos, token) {
  const res = await fetch(`${API_BASE}/v1/cuentas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      correo: datos.correo,
      nombre: datos.nombre,
      rol: datos.rol,
      contrasena: datos.contrasena,
      rutaTerritorial: datos.rutaTerritorial || null,
      bancoId: datos.bancoId || null,
    }),
  });
  if (res.ok) return res.json();
  const problema = await res.json().catch(() => ({}));
  throw new Error(problema.detalle ?? `Error ${res.status}`);
}
