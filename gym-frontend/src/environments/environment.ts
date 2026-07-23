export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',

  // ── Torniquete Dahua ───────────────────────────────────────────────────
  // Cambiar torniqueteSimulado a false cuando el dispositivo esté conectado
  torniqueteSimulado: true,
  torniquete: {
    ip:       '192.168.1.100',   // IP del dispositivo en la red local
    puerto:   80,
    usuario:  'admin',
    password: 'admin123',
    canal:    1
  }
};
