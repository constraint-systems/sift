import state from '/m/state.js'
import {
  makeLayers,
  setOffsetReadout,
  setZoom,
  setShowControls,
  setShowInfo,
  inputLoadImage,
  saveImage,
} from '/m/actions.js'
import { render } from '/m/render.js'

export function keyAction(key, e) {
  let km = state.km

  if (key === 'o') {
    inputLoadImage()
  }
  if (key === 'p') {
    saveImage()
  }

  if (km['<']) {
    if (state.layer_num > 4) {
      state.layer_num /= 2
      makeLayers()
      render()
    }
  }
  if (km['>']) {
    if (state.layer_num < 64) {
      state.layer_num *= 2
      makeLayers()
      render()
    }
  }
  if (km['-']) {
    if (state.zoom > 0.125) {
      state.zoom /= 2
      setZoom()
    }
  }
  if (km['+']) {
    if (state.zoom < 4) {
      state.zoom *= 2
      setZoom()
    }
  }

  if (km['?']) {
    setShowControls(!state.show_controls)
  }

  if (km['i']) {
    setShowInfo(!state.show_info)
  }
  if (km['x']) {
    setShowInfo(false)
  }

  let move = [0, 0]
  let mover = 16
  if (e.shiftKey) {
    mover = 8
  }
  if (km.h | km.arrowleft) move[0] -= mover
  if (km.l | km.arrowright) move[0] += mover
  if (km.j | km.arrowdown) move[1] += mover
  if (km.k | km.arrowup) move[1] -= mover
  if (move[0] !== 0 || move[1] !== 0) {
    // invert arguably feels more natural
    state.x_offset -= move[0]
    state.y_offset -= move[1]
    setOffsetReadout()
    render()
  }
}

function downHandler(e) {
  state.km[e.key.toLowerCase()] = true
  keyAction(e.key.toLowerCase(), e)
}

function upHandler(e) {
  state.km[e.key.toLowerCase()] = false
}

export function initKeyboard() {
  window.addEventListener('keydown', downHandler)
  window.addEventListener('keyup', upHandler)
  window.trigger = function(key) {
    key = key.toLowerCase()
    state.km[key] = true
    keyAction(key, {})
    setTimeout(() => {
      state.km[key] = false
    }, 200)
  }
}
