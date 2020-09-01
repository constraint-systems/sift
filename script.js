import state from '/m/state.js'
import {
  loadImage,
  setZoom,
  setOffsetReadout,
  setLayersReadout,
  setZoomReadout,
  setShowControls,
  setShowInfo,
} from '/m/actions.js'
import { render } from '/m/render.js'
import { initKeyboard } from '/m/keyboard.js'
import { initMouse } from '/m/mouse.js'

window.addEventListener('load', () => {
  let render_canvas = document.querySelector('#render')
  state.rx = render_canvas.getContext('2d')
  state.offset_readout = document.querySelector('#offset_readout')
  state.layers_readout = document.querySelector('#layers_readout')
  state.zoom_readout = document.querySelector('#zoom_readout')
  setOffsetReadout()
  setLayersReadout()
  setZoomReadout()
  setShowControls(true)
  setShowInfo(true)

  loadImage('bowie.jpg')
  initKeyboard()
  initMouse()
})
