import state from '/m/state.js'
import { setOffsetReadout } from '/m/actions.js'
import { render } from '/m/render.js'

function unifyMove(newx, newy) {
  let layer_num = state.layer_num
  let dx = newx - state.mouse_down[0]
  let dy = newy - state.mouse_down[1]
  // let rdx = Math.round(dx / (layer_num / 2))
  // let rdy = Math.round(dy / (layer_num / 2))
  let rdx = Math.round(dx / 8) * 8
  let rdy = Math.round(dy / 8) * 8
  let new_offset_x = state.offset_cache[0] - rdx
  let new_offset_y = state.offset_cache[1] - rdy
  if (new_offset_x !== state.x_offset || new_offset_y !== state.y_offset) {
    state.x_offset = state.offset_cache[0] - rdx
    state.y_offset = state.offset_cache[1] - rdy
    render()
    setOffsetReadout()
  }
}

function touchStart(e) {
  state.touch_mode = true
  state.mouse_down = [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
  state.offset_cache = [state.x_offset, state.y_offset]
}
function touchMove(e) {
  if (state.touch_mode) {
    unifyMove(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    e.preventDefault()
  }
}
function touchEnd(e) {
  state.touch_mode = false
  state.mouse_down = null
  state.offset_cache = null
}

function mouseDown(e) {
  if (!state.touch_mode) {
    state.mouse_down = [e.pageX, e.pageY]
    state.offset_cache = [state.x_offset, state.y_offset]
  }
}
function mouseMove(e) {
  if (state.mouse_down !== null) {
    unifyMove(e.pageX, e.pageY)
  }
}
function mouseUp(e) {
  state.mouse_down = null
  state.offset_cache = null
}

export function initMouse(e) {
  let $mouse = document.querySelector('#mouse_catcher')

  $mouse.addEventListener('touchstart', touchStart)
  $mouse.addEventListener('touchmove', touchMove, { passive: false })
  $mouse.addEventListener('touchend', touchEnd)

  $mouse.addEventListener('mousedown', mouseDown)
  $mouse.addEventListener('mousemove', mouseMove)
  $mouse.addEventListener('mouseup', mouseUp)
}
