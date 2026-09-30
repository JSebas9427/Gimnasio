export const environment = {
  production: true,
  // Usa el mismo equipo desde el que se abrió la app (localhost en el servidor,
  // o su IP si se entra desde otro PC de la red) con el backend en el puerto 8080.
  apiUrl: `${window.location.protocol}//${window.location.hostname}:8080/api/v1`,

  torniqueteSimulado: true,
  torniquete: {
    ip:       '192.168.0.150/#/',
    puerto:   80,
    usuario:  'admin',
    password: '10203040aA',
    canal:    1
  }
};
