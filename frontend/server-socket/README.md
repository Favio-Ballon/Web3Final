# Servidor Socket.IO para Sistema de Votación

Este servidor maneja la comunicación en tiempo real entre las máquinas del jurado y las máquinas de votación.

## Instalación

```bash
npm install socket.io express cors
npm install -D @types/node typescript ts-node nodemon
```

## Uso

```bash
npm run dev
```

El servidor se ejecutará en el puerto 3001 y estará disponible en todas las interfaces de red (0.0.0.0).

## Eventos Soportados

### Máquina del Jurado
- `registrar_maquina_jurado`: Registra una máquina del jurado
- `habilitar_papeleta`: Envía una papeleta habilitada a las máquinas de votación

### Máquina de Votación  
- `registrar_maquina_votacion`: Registra una máquina de votación
- `registrar_voto`: Registra un voto completado

### Eventos Broadcast
- `papeleta_habilitada`: Se envía a todas las máquinas de votación
- `voto_registrado`: Confirma que el voto fue registrado
- `papeleta_cerrada`: Notifica que una papeleta fue cerrada
