# Sistema de Votación con Sockets

Este sistema permite el manejo de votaciones de forma distribuida con comunicación en tiempo real entre máquinas.

## Estructura del Sistema

- **Máquina del Jurado**: Verifica votantes y habilita papeletas
- **Máquina de Votación**: Registra votos de forma anónima
- **Servidor Socket.IO**: Facilita la comunicación entre máquinas

## Configuración del Servidor Socket.IO

### 1. Instalar dependencias del servidor

```bash
cd server-socket
npm install
```

### 2. Ejecutar el servidor

```bash
cd server-socket
npm run dev
```

El servidor se ejecutará en `http://192.168.0.9:3001` (tu IP local).

## Configuración del Frontend

### 1. Instalar dependencias del frontend

```bash
yarn install
```

### 2. Ejecutar el frontend

```bash
yarn dev
```

## Uso del Sistema

### Paso 1: Configurar Máquina del Jurado
1. Abrir el navegador en la primera máquina
2. Ir a `http://localhost:5173/voting/jurado`
3. El sistema se conectará automáticamente al servidor Socket.IO
4. Buscar votantes por CI y habilitar papeletas

### Paso 2: Configurar Máquina de Votación
1. Abrir el navegador en la segunda máquina (diferente computadora)
2. Ir a `http://192.168.0.9:5173/voting/votar` (reemplazar con tu IP)
3. La máquina esperará a recibir papeletas habilitadas

### Paso 3: Proceso de Votación
1. El jurado verifica al votante y habilita la papeleta
2. La papeleta aparece automáticamente en la máquina de votación
3. El votante selecciona su candidato y confirma el voto
4. El voto se registra de forma anónima y la papeleta se cierra

## Endpoints y Puertos

- **Frontend**: Puerto 5173 (Vite dev server)
- **Servidor Socket.IO**: Puerto 3001
- **Backend API**: Puerto 8000 (Django/FastAPI)

## Flujo de Datos

1. **Habilitación**: Jurado → Socket Server → Máquina Votación
2. **Votación**: Máquina Votación → Backend API + Socket Server
3. **Confirmación**: Socket Server → Jurado + Máquina Votación

## Seguridad

- Los votos se almacenan de forma anónima
- Cada papeleta tiene un ID único
- No se guarda relación entre votante y voto
- Las máquinas se identifican con IDs únicos

## Monitoreo

Puedes verificar el estado del servidor Socket.IO en:
`http://192.168.0.9:3001/health`

## Troubleshooting

### Error de conexión
- Verificar que el servidor Socket.IO esté ejecutándose
- Confirmar que la IP 192.168.0.9 sea correcta
- Verificar que no haya firewalls bloqueando el puerto 3001

### Papeletas no aparecen
- Verificar que ambas máquinas estén conectadas
- Revisar la consola del navegador para errores
- Confirmar que el jurado haya habilitado correctamente la papeleta
