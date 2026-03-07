import { io } from 'socket.io-client'
import { onBeforeUnmount } from 'vue'

let socket = null

export function getSocket() {
  return socket
}

export function connectSocket(token, roomId, address) {
  if (socket) {
    socket.disconnect()
  }
  socket = io(import.meta.env.VITE_WS_API, {
    transports: ['websocket'],
    path: '/chat',
    reconnection: true,
    reconnectionAttempts: Infinity,
    autoConnect: false,
    query: { token, room_id: roomId, address },
  })
  socket.open()
  return socket
}

export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect()
  }
}

export function updateSocketQuery(query) {
  if (socket) {
    socket.io.opts.query = query
  }
}

export function useSocketEvent(event, handler) {
  const s = getSocket()
  s?.on(event, handler)
  onBeforeUnmount(() => {
    s?.off(event, handler)
  })
}

export function emitSocket(event, data) {
  const s = getSocket()
  if (s && s.connected) {
    s.emit(event, data)
  }
}
