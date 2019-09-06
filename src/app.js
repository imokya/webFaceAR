import { loadBRFv5Model, brfv5 } from './libs/brfv5/brfv5__init'
import { 
  configureCameraInput, 
  configureFaceTracking,
  configureNumFacesToTrack
} from './libs/brfv5/brfv5__configure'

import { 
  enableDynamicPerformance, 
  disableDynamicPerformance 
} from './libs/brfv5/brfv5__dynamic_performance'

import { SystemUtils }  from './libs/utils/utils__system'
import { drawCircles, drawFillCurvedTriangles, drawFillCurvedTriangles2, drawTriangles  } from './libs/utils/utils__canvas'
import { faceTriangles68l, libUpperTriangles, libLowerTriangles, libTriangles } from './libs/utils/utils__face_triangles.js'

import { vertexShader, fragShader } from './libs/shader'
import * as PIXI from 'pixi.js'

import './styles/style.css'

const _w = 640, _h = 480
const _modelName = '68l_min'
const _numFacesToTrack = 1
const _numTrackingPasses = 3

let _enableDynamicPerformance = SystemUtils.isMobileOS
let _videoEl, _canvasEl, _drawCanvasEl
let _manager, _config
let _onTracking = false

let _app, _graphic, _filter
let _lipColor = 0xf10f59

const app = {
  
  init()　{
    this.initDom()
    this.initCamera()
    this.initRender()
    this.initColorPicker()
    this.tick()
  },

  initColorPicker() {
    const colorEl = document.querySelectorAll('.color-picker>li')
    colorEl.forEach(item=> {
      const color = item.getAttribute('data-color')
      item.style.backgroundColor = '#' + color.substr(2) 
    })
    document.addEventListener('click', e=> {
      if (e.target.tagName.toLowerCase() === 'li') {
        const color = e.target.getAttribute('data-color')
        _lipColor = color
      }
    })
  },

  draw() {
    const ctx = _canvasEl.getContext('2d')
    ctx.setTransform(-1.0, 0, 0, 1, _w, 0) 
    ctx.drawImage(_videoEl, 0, 0, _w, _h)
    ctx.setTransform(1.0, 0, 0, 1, 0, 0)
  },

  tick()　{
    this.draw()
    if (_onTracking) {
      this.trackFace()
    }
    //requestAnimationFrame(this.tick.bind(this))
  },

  trackFace() {
    const ctx = _canvasEl.getContext('2d')
    const imageData = ctx.getImageData(0, 0, _w, _h)
    _manager.update(imageData)
    const faces = _manager.getFaces()
    for (let i = 0; i < faces.length; i++)　{
      const face = faces[i]
      if (face.state === brfv5.BRFv5State.FACE_TRACKING) {
        if (face.landmarks.length === 68) {
          //drawTriangles(ctx, face.vertices, faceTriangles68l, 1.5, '#00a0ff', 0.4);
        }
        _graphic.clear()
        this.drawLips(face.vertices, libUpperTriangles)
        this.drawLips(face.vertices, libLowerTriangles)
      } else {
        //doDrawFaceDetection = true
      }
    }
  },

  drawLips(vers, tris) {
    const si = tris[0]
    const sx = vers[si * 2]
    const sy = vers[si * 2 + 1]
    _graphic.beginFill(_lipColor, 0.6)
    _graphic.moveTo(sx, sy)
    let nx, ny, cx, cy
    for (let i = 1, len = tris.length; i < len - 1; i++) {
      const index = tris[i] 
      const nextIndex = tris[i　+ 1]
      const x = vers[index * 2]
      const y = vers[index * 2 + 1]
      nx = vers[nextIndex * 2]
      ny = vers[nextIndex * 2 + 1]
      cx = (x + nx) / 2
      cy = (y + ny) / 2
      _graphic.quadraticCurveTo(x, y, cx, cy)
    }
    _graphic.quadraticCurveTo(nx, ny, sx, sy)
    _graphic.endFill()
  },

  initRender() {
   _app = new PIXI.Application({
     width: _w,
     height: _h,
     transparent: true,
     antialias: true,
     view: _drawCanvasEl
   })
   _graphic = new PIXI.Graphics()
   _app.stage.addChild(_graphic)
   _app.ticker.add(this.tick.bind(this))
   _filter = new PIXI.filters.BlurFilter(2)
   _graphic.filters = [_filter]
  },

  initDom() {
    const containerEl = document.querySelector('.container')
    _videoEl = document.createElement('video')
    _videoEl.setAttribute('width', _w)
    _videoEl.setAttribute('height', _h)
    _videoEl.setAttribute('playsinline', true)
    _videoEl.setAttribute('webkit-playsinline', true)
    _videoEl.style.position = 'absolute'
    _videoEl.style.display = 'none'
    containerEl.appendChild(_videoEl)

    _canvasEl = document.createElement('canvas')
    _canvasEl.setAttribute('width', _w)
    _canvasEl.setAttribute('height', _h)
    _canvasEl.style.position = 'absolute'
    containerEl.appendChild(_canvasEl)

    _drawCanvasEl = document.createElement('canvas')
    _drawCanvasEl.setAttribute('width', _w)
    _drawCanvasEl.setAttribute('height', _h)
    _drawCanvasEl.style.position = 'absolute'
    containerEl.appendChild(_drawCanvasEl)
  },

  initCamera()　{
    const constrains = {
      audio: false,
      video: {
        width: _w,
        height: _h,
        facingMode: 'usr'
      }
    }
    navigator.mediaDevices.getUserMedia(constrains).then(stream => {
      _videoEl.srcObject = stream
      _videoEl.play()
      this.loadModel()
    })
  },

  loadModel() {
    loadBRFv5Model(_modelName, './models/', null, function(progress) {})
    .then(({ brfv5Manager, brfv5Config }) => {
      _manager = brfv5Manager
      _config = brfv5Config
      this.initTracking()
    })
  },

  initTracking() {
    configureCameraInput(_config, _w, _h)
    configureFaceTracking(_config, _numTrackingPasses, true)
    configureNumFacesToTrack(_config, _numFacesToTrack)
    _manager.reset()
    if (_enableDynamicPerformance) {
      enableDynamicPerformance(_manager, _config)
    } else {
      disableDynamicPerformance()
    }
    _manager.configure(_config)
    _onTracking = true
  }

}

app.init()