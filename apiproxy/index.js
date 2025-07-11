const { createProxyMiddleware } = require("http-proxy-middleware");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const bodyParser = require("body-parser");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Credentials",
    ],
  })
);

const onProxyReq = async function (proxyReq, req, res) {
  if (!req.cookies) {
    console.log("cookies:" + req);
    console.log("cookies:" + req.cookies);
    console.error("No cookies found in the request");
    return;
  }
  const token = req.cookies.access;
  console.log("Token found: " + token);
  if (token) {
    proxyReq.setHeader("Authorization", "Bearer " + token);
  }
};

// Proxy para usuarios - redirige a http://127.0.0.1:8000/usuarios/
const usuariosProxy = createProxyMiddleware({
  target: "http://127.0.0.1:8000/",
  changeOrigin: true,
  pathRewrite: (path, req) => {
    console.log("Path recibido por proxy: " + path);
    console.log("URL original completa: " + req.originalUrl);
    // /info/me/ -> /usuarios/info/me/
    const newPath = "/usuarios" + path;
    console.log("Nueva ruta: " + newPath);
    return newPath;
  },
  on: {
    proxyReq: onProxyReq,
  },
});

// Proxy para padrón - redirige a https://127.0.0.1:7182/api/votantes
const padronProxy = createProxyMiddleware({
  target: "https://127.0.0.1:7182/",
  changeOrigin: true,
  secure: false, // Para desarrollo con certificados auto-firmados
  pathRewrite: (path, req) => {
    console.log("Path recibido por proxy padrón: " + path);
    console.log("URL original completa: " + req.originalUrl);
    // Express ya removió /webproxy/padron, así que agregamos /api/votantes
    // /buscar -> /api/votantes/buscar
    const newPath = "/api" + path;
    console.log("bofy: " + req.body);
    console.log("Nueva ruta padrón: " + newPath);
    return newPath;
  },
  on: {
    proxyReq: onProxyReq,
  },
});

// Proxy para elecciones - redirige a http://127.0.0.1:8080/eleccion/
const eleccionProxy = createProxyMiddleware({
  target: "http://127.0.0.1:8080/",
  changeOrigin: true,
  secure: false, // Para desarrollo con certificados auto-firmados
  pathRewrite: (path, req) => {
    console.log("Path recibido por proxy padrón: " + path);
    console.log("URL original completa: " + req.originalUrl);
    // Express ya removió /webproxy/padron, así que agregamos /api/votantes
    // /buscar -> /api/votantes/buscar
    const newPath = "/eleccion" + path;
    console.log("bofy: " + req.body);
    console.log("Nueva ruta padrón: " + newPath);
    return newPath;
  },
  on: {
    proxyReq: onProxyReq,
  },
});
// Proxy para votantes - redirige a http://127.0.0.1:8090/votacion/
const votantesProxy = createProxyMiddleware({
  target: "http://127.0.0.1:8090/",
  changeOrigin: true,
  secure: false, // Para desarrollo con certificados auto-firmados
  pathRewrite: (path, req) => {
    console.log("Path recibido por proxy padrón: " + path);
    console.log("URL original completa: " + req.originalUrl);
    // Express ya removió /webproxy/padron, así que agregamos /api/votantes
    // /buscar -> /api/votantes/buscar
    const newPath = "/votacion" + path;
    console.log("bofy: " + req.body);
    console.log("Nueva ruta padrón: " + newPath);
    return newPath;
  },
  on: {
    proxyReq: onProxyReq,
  },
});

const port = 3000;

app.use(cookieParser());

// Configurar las rutas de proxy con base /webproxy/
app.use("/webproxy/usuario", usuariosProxy);
app.use("/webproxy/padron", padronProxy);
app.use("/webproxy/eleccion", eleccionProxy);
app.use("/webproxy/votantes", votantesProxy);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require("./routes/auth.routes")(app);

app.listen(port, () => {
  console.log(`Proxy server is running at http://localhost:${port}`);
});
