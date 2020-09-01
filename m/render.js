import state from '/m/state.js'

export function render() {
  let rx = state.rx
  let layers = state.layers
  let img = state.img
  let x_offset = state.x_offset
  let y_offset = state.y_offset
  let x_step = x_offset / state.layer_num
  let y_step = y_offset / state.layer_num

  let x_offset_adjust = x_offset < 0 ? Math.abs(x_offset) : 0
  let y_offset_adjust = y_offset < 0 ? Math.abs(y_offset) : 0

  rx.canvas.width = img.width + Math.abs(x_offset)
  rx.canvas.height = img.height + Math.abs(y_offset)
  rx.fillStyle = 'black'
  rx.fillRect(0, 0, rx.canvas.width, rx.canvas.height)
  rx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < layers.length; i++) {
    let canvas = layers[i]
    rx.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      i * x_step + x_offset_adjust,
      i * y_step + y_offset_adjust,
      canvas.width,
      canvas.height
    )
  }
}
