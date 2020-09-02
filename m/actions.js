import state from '/m/state.js'
import { render } from '/m/render.js'

function binBit(val) {
  let layer_num = state.layer_num
  let bin = 256 / layer_num
  return Math.round((val + 1) / bin)
}

export function makeLayers() {
  let img = state.img
  let layer_num = state.layer_num
  let image_data = state.image_data
  let bin = 256 / layer_num

  let pixels = image_data.data
  let slice_canvases = [...Array(layer_num)].map(n => {
    let canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    let cx = canvas.getContext('2d')
    return canvas
  })
  let slices = slice_canvases.map(c => {
    let cx = c.getContext('2d')
    return cx.getImageData(0, 0, img.width, img.height)
  })
  for (let i = 0; i < pixels.length; i += 4) {
    let r = binBit(pixels[i])
    let g = binBit(pixels[i + 1])
    let b = binBit(pixels[i + 2])
    let combined = [r, g, b]
    let ranked = [1, 1, 1]
    let min_val = Math.min(...combined)
    let min_index = combined.indexOf(min_val)
    ranked[min_index] = 0
    let max_val = Math.max(...combined)
    let max_index = combined.indexOf(max_val)
    ranked[max_index] = 2
    let mid_index = ranked.indexOf(1)
    let mid_val = combined[mid_index]

    let slice_counter = 0
    for (let j = 0; j < min_val; j++) {
      let slice = slices[slice_counter].data
      // all
      for (let k = 0; k < 3; k++) {
        slice[i + k] = bin
      }
      slice[i + 3] = 255
      slice_counter++
    }

    let mid_left = mid_val - min_val
    for (let j = 0; j < mid_left; j++) {
      let slice = slices[slice_counter].data
      for (let k = 0; k < 3; k++) {
        if (k === mid_index || k === max_index) {
          slice[i + k] = bin
        } else {
          slice[i + k] = 0
        }
      }
      slice[i + 3] = 255
      slice_counter++
    }

    let max_left = max_val - mid_val
    for (let j = 0; j < max_left; j++) {
      let slice = slices[slice_counter].data
      for (let k = 0; k < 3; k++) {
        if (k === max_index) {
          slice[i + k] = bin
        } else {
          slice[i + k] = 0
        }
      }
      slice[i + 3] = 255
      slice_counter++
    }
  }

  for (let i = 0; i < slices.length; i++) {
    let slice_canvas = slice_canvases[i]
    let cx = slice_canvas.getContext('2d')
    let slice = slices[i]
    cx.putImageData(slice, 0, 0)
    // document.body.appendChild(slice_canvas)
  }
  state.layers = slice_canvases

  render()
  setLayersReadout()
}

export function loadImage(src) {
  let layer_num = state.layer_num
  let bin = 256 / layer_num
  let img = document.createElement('img')
  let limit = 1920
  img.onload = function() {
    let w = img.width
    let h = img.height
    if (img.width > 1280 || img.height > 1280) {
      let aspect = w / h
      let nw, nh
      if (aspect > 1) {
        // wider
        nw = limit
        nh = Math.round(nw / aspect)
      } else {
        // taller
        nh = limit
        nw = Math.round(nh * aspect)
      }
      let resize = confirm(
        `This image is large enough (${w}x${h}) that it may be slow to process. Click OK to resize it to ${nw}x${nh} or cancel to keep it the original size and deal with the consequences.`
      )
      if (resize) {
        // resize
        w = nw
        h = nh
      }
    }
    let canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    let cx = canvas.getContext('2d')
    // here need to use original (not adjust image size)
    cx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h)
    let image_data = cx.getImageData(0, 0, w, h)
    state.img = { width: w, height: h }
    state.image_data = image_data
    makeLayers()
    setZoom()
  }
  img.src = src
}

export function setZoom() {
  state.rx.canvas.style.transform = `translate(-50%, -50%) scale(${state.zoom}`
  setZoomReadout()
}

export function setOffsetReadout() {
  state.offset_readout.innerHTML = `${-state.x_offset / 8},${-state.y_offset /
    8}`
}
export function setLayersReadout() {
  state.layers_readout.innerHTML = state.layer_num
}
export function setZoomReadout() {
  state.zoom_readout.innerHTML = state.zoom * 100 + '%'
}

export function setShowControls(val) {
  let $controls = document.querySelector('#controls')
  let $toggle = document.querySelector('#hidden_control_toggle')
  if (val === true) {
    $controls.style.display = 'block'
    $toggle.style.display = 'none'
  } else {
    $controls.style.display = 'none'
    $toggle.style.display = 'block'
  }
  state.show_controls = val
}

export function setShowInfo(val) {
  let $info = document.querySelector('#info_box')
  let $info_button = document.querySelector('#info_button')
  if (val === true) {
    $info.style.display = 'block'
    $info_button.classList.add('active')
  } else {
    $info.style.display = 'none'
    $info_button.classList.remove('active')
  }
  state.show_info = val
}

export function inputLoadImage() {
  let input = document.querySelector('#file_input')
  function handleChange(e) {
    let images = []
    for (let item of this.files) {
      if (item.type.indexOf('image') < 0) {
        continue
      }
      let src = URL.createObjectURL(item)
      // reset for new image
      state.x_offset = 0
      state.y_offset = 0
      state.zoom = 1
      state.layer_num = 16
      loadImage(src)
    }
    this.removeEventListener('change', handleChange)
  }
  input.addEventListener('change', handleChange)

  input.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  )
}

export function saveImage() {
  let link = document.createElement('a')
  let rx = state.rx
  rx.canvas.toBlob(function(blob) {
    link.setAttribute(
      'download',
      'sift-' + Math.round(new Date().getTime() / 1000) + '.png'
    )
    link.setAttribute('href', URL.createObjectURL(blob))
    link.dispatchEvent(
      new MouseEvent(`click`, {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    )
  })
}

export function onDrop(e) {
  e.preventDefault()
  e.stopPropagation()
  let file = e.dataTransfer.files[0]
  let filename = file.path ? file.path : file.name ? file.name : ''
  let src = URL.createObjectURL(file)
  loadImage(src)
}

export function onDrag(e) {
  e.stopPropagation()
  e.preventDefault()
  e.dataTransfer.dropEffect = 'copy'
}

export function onPaste(e) {
  e.preventDefault()
  e.stopPropagation()
  for (const item of e.clipboardData.items) {
    if (item.type.indexOf('image') < 0) {
      continue
    }
    let file = item.getAsFile()
    let src = URL.createObjectURL(file)
    loadImage(src)
  }
}
