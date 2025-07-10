import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/webproxy/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});
//cuando la petición se va a enviar a la API, se ejecuta este interceptor
apiClient.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    console.error("Error en la solicitud a la API: ", error);
    return Promise.reject(error);
  }
);
//cuando la petición ya llegó a la API y se recibe una respuesta, se ejecuta este interceptor
apiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    if (error.response.status === 401) {
      try {
        // Try to refresh token directly without importing AuthService
        await axios.post(
          "http://localhost:3000/auth/refresh/",
          {},
          { withCredentials: true }
        );
      } catch (authError) {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
          // Se limpia las variables globales de redux, no las de localStorag


        }
        console.log("auth error", authError);
        return Promise.reject(authError);
      }
      return apiClient.request(error.config);
    }

    console.error("Error en la respuesta de la API: ", error.response);
    return Promise.reject(error);
  }
);

export default apiClient;
