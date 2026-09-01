// One shared tooltip for the whole app. Per-row popover components are
// expensive (a Best 50 page would mount 50 of them) and native `title` is
// unstyled, slow to appear and dead on touch — so a single fixed element is
// moved under whichever `v-tip` target is hovered (pointer devices) or
// tapped (touch: tap toggles, tapping elsewhere / Escape / scroll hides).

let tipEl = null
let current = null
let bound = false

function ensure() {
  if (tipEl) return tipEl
  tipEl = document.createElement('div')
  tipEl.className = 'app-tip hud'
  tipEl.setAttribute('role', 'tooltip')
  tipEl.hidden = true
  document.body.appendChild(tipEl)
  if (!bound) {
    bound = true
    document.addEventListener(
      'pointerdown',
      (e) => {
        if (current && !current.contains(e.target)) hide()
      },
      true,
    )
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hide()
    })
  }
  return tipEl
}

function place(target) {
  const r = target.getBoundingClientRect()
  const w = tipEl.offsetWidth
  const h = tipEl.offsetHeight
  let x = r.left + r.width / 2 - w / 2
  x = Math.max(8, Math.min(x, window.innerWidth - w - 8))
  let y = r.top - h - 8
  if (y < 8) y = r.bottom + 8
  tipEl.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`
}

function show(target, text) {
  if (!text) return
  const t = ensure()
  t.textContent = text
  t.hidden = false
  place(target)
  current = target
}

export function hide() {
  if (tipEl) tipEl.hidden = true
  current = null
}

export const vTip = {
  mounted(el, binding) {
    el.__tip = binding.value
    const h = {
      enter: (e) => {
        if (e.pointerType !== 'touch') show(el, el.__tip)
      },
      leave: (e) => {
        if (e.pointerType !== 'touch' && current === el) hide()
      },
      up: (e) => {
        if (e.pointerType !== 'touch') return
        if (current === el) hide()
        else show(el, el.__tip)
      },
    }
    el.__tipHandlers = h
    el.addEventListener('pointerenter', h.enter)
    el.addEventListener('pointerleave', h.leave)
    el.addEventListener('pointerup', h.up)
    el.classList.toggle('has-tip', !!binding.value)
  },
  updated(el, binding) {
    el.__tip = binding.value
    el.classList.toggle('has-tip', !!binding.value)
    if (current === el) {
      if (binding.value) show(el, binding.value)
      else hide()
    }
  },
  unmounted(el) {
    const h = el.__tipHandlers
    if (h) {
      el.removeEventListener('pointerenter', h.enter)
      el.removeEventListener('pointerleave', h.leave)
      el.removeEventListener('pointerup', h.up)
    }
    if (current === el) hide()
  },
}
