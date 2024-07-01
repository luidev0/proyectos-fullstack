import axios from "axios";

import { BASE_URL } from "./constants";

// Creación de una instancia de Axios con configuraciones personalizadas
const axiosInstance = axios.create({
  baseURL: BASE_URL, // URL base para todas las peticiones HTTP
  timeout: 10000, // Tiempo máximo de espera para las peticiones, en milisegundos
  headers: {
    "Content-Type": "application/json", // Tipo de contenido para las peticiones, en este caso JSON
  },
});

// Interceptor para las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    // Función que se ejecuta antes de enviar una petición

    // Obtener el token de acceso almacenado en localStorage
    const accessToken = localStorage.getItem("token");

    // Si existe un token de acceso, agregarlo a los headers de la petición
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Devolver la configuración actualizada
    return config;
  },
  (error) => {
    // Función que se ejecuta si hay un error al modificar la configuración de la petición
    return Promise.reject(error);
  }
);

// Exportar la instancia de Axios configurada
export default axiosInstance;
