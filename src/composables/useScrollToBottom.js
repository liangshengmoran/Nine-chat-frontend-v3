export function scrollToBottom(options = { id: 'panelEnd', animation: false }) {
  const { id = 'panelEnd', animation = false } = options
  const el = document.getElementById(id)
  if (!el) return
  const params = {}
  if (animation) params.behavior = 'smooth'
  el.scrollIntoView(params)
}
