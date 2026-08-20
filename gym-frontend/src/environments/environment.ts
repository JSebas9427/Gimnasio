export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',

  // ── Torniquete Dahua ───────────────────────────────────────────────────
  // Cambiar torniqueteSimulado a false cuando el dispositivo esté conectado
  torniqueteSimulado: true,
  torniquete: {
    ip:       '192.168.0.150/#/',   // IP del dispositivo en la red local
    puerto:   80,
    usuario:  'admin',
    password: '10203040aA',
    canal:    1
  }
};
