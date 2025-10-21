/**
 * WebXR VR全景查看器插件
 *
 * 特性:
 * - 懒加载：点击进入VR时才初始化WebGL和加载图片
 * - 自动释放：退出VR时自动销毁所有资源
 * - 支持超大尺寸图片（自动缩放到4096）
 * - 完整内存管理（GPU和CPU内存）
 *
 * 使用方法:
 * const vrViewer = new VREquirectangularViewer({
 *   imageUrl: 'img/equirectangular.jpg',
 *   maxTextureSize: 4096,
 *   onError: (error) => console.error(error),
 *   onVRStart: () => console.log('VR已启动'),
 *   onVREnd: () => console.log('VR已退出，资源已释放')
 * });
 *
 * // 检查WebXR支持（无需加载任何资源）
 * const isSupported = await vrViewer.isVRSupported();
 *
 * // 进入VR模式（此时才加载WebGL、着色器、纹理等）
 * await vrViewer.enterVR();
 *
 * // 退出VR模式（自动销毁所有资源）
 * vrViewer.exitVR();
 *
 * // 手动销毁（通常不需要，退出VR会自动调用）
 * vrViewer.destroy();
 */

class VREquirectangularViewer {
  constructor(options = {}) {
    // 配置选项
    this.imageUrl = options.imageUrl || 'img/equirectangular.jpg'
    this.maxTextureSize = options.maxTextureSize || 4096 // VR设备安全值
    this.onError = options.onError || console.error
    this.onVRStart = options.onVRStart || (() => {})
    this.onVREnd = options.onVREnd || (() => {})

    // WebGL和WebXR（懒加载，进入VR时才初始化）
    this.gl = null
    this.canvas = null
    this.canvasId =
      'vr-equirectangular-' +
      Date.now() +
      '-' +
      Math.random().toString(36).slice(2, 11)
    this.xrSession = null
    this.xrRefSpace = null

    // 渲染资源（懒加载）
    this.shaderProgram = null
    this.programInfo = null
    this.sphereBuffers = null
    this.texture = null
    this.textureLoaded = false

    // 内部状态
    this.isInitialized = false
    this.autoDestroyOnExit = true // 退出VR时自动销毁
  }

  /**
   * 检查设备是否支持WebXR VR
   */
  async isVRSupported() {
    if (!navigator.xr) {
      return false
    }

    try {
      return await navigator.xr.isSessionSupported('immersive-vr')
    } catch (e) {
      return false
    }
  }

  /**
   * 初始化WebGL上下文（仅在需要时调用）
   */
  _initWebGL() {
    if (this.gl) return true

    // 创建隐藏的canvas并设置唯一ID
    this.canvas = document.createElement('canvas')
    this.canvas.id = this.canvasId
    this.canvas.style.display = 'none'
    document.body.appendChild(this.canvas)

    // 初始化WebGL
    this.gl =
      this.canvas.getContext('webgl2', {
        xrCompatible: true,
        alpha: false,
        antialias: false, // VR模式下禁用抗锯齿以提升性能
        depth: true,
        stencil: false,
        powerPreference: 'high-performance'
      }) ||
      this.canvas.getContext('webgl', {
        xrCompatible: true,
        alpha: false,
        antialias: false,
        depth: true,
        stencil: false,
        powerPreference: 'high-performance'
      })

    if (!this.gl) {
      this.onError('WebGL不可用')
      return false
    }

    // 设置WebGL状态
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
    this.gl.enable(this.gl.DEPTH_TEST)
    this.gl.disable(this.gl.CULL_FACE)

    return true
  }

  /**
   * 初始化着色器
   */
  _initShaders() {
    const gl = this.gl

    const vertexShaderSource = `
            precision highp float;
            attribute vec3 aPosition;
            attribute vec2 aTexCoord;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying vec2 vTexCoord;
            
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
                vTexCoord = aTexCoord;
            }
        `

    const fragmentShaderSource = `
            precision highp float;
            varying vec2 vTexCoord;
            uniform sampler2D uTexture;
            
            void main() {
                gl_FragColor = texture2D(uTexture, vTexCoord);
            }
        `

    const vertexShader = this._compileShader(
      gl.VERTEX_SHADER,
      vertexShaderSource
    )
    const fragmentShader = this._compileShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    )

    if (!vertexShader || !fragmentShader) return false

    this.shaderProgram = gl.createProgram()
    gl.attachShader(this.shaderProgram, vertexShader)
    gl.attachShader(this.shaderProgram, fragmentShader)
    gl.linkProgram(this.shaderProgram)

    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
      this.onError(
        '着色器链接失败: ' + gl.getProgramInfoLog(this.shaderProgram)
      )
      return false
    }

    this.programInfo = {
      program: this.shaderProgram,
      attribLocations: {
        position: gl.getAttribLocation(this.shaderProgram, 'aPosition'),
        texCoord: gl.getAttribLocation(this.shaderProgram, 'aTexCoord')
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(
          this.shaderProgram,
          'uProjectionMatrix'
        ),
        modelViewMatrix: gl.getUniformLocation(
          this.shaderProgram,
          'uModelViewMatrix'
        ),
        texture: gl.getUniformLocation(this.shaderProgram, 'uTexture')
      }
    }

    return true
  }

  _compileShader(type, source) {
    const gl = this.gl
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      this.onError('着色器编译错误: ' + gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }

    return shader
  }

  /**
   * 创建球体几何
   */
  _createSphere() {
    const gl = this.gl
    const latBands = 60
    const lonBands = 60
    const radius = 10

    const positions = []
    const texCoords = []
    const indices = []

    for (let lat = 0; lat <= latBands; lat++) {
      const theta = (lat * Math.PI) / latBands
      const sinTheta = Math.sin(theta)
      const cosTheta = Math.cos(theta)

      for (let lon = 0; lon <= lonBands; lon++) {
        const phi = (lon * 2 * Math.PI) / lonBands
        const sinPhi = Math.sin(phi)
        const cosPhi = Math.cos(phi)

        const x = cosPhi * sinTheta
        const y = cosTheta
        const z = sinPhi * sinTheta

        // 修复镜像:反转纹理U坐标
        const u = lon / lonBands
        const v = lat / latBands

        positions.push(radius * x, radius * y, radius * z)
        texCoords.push(u, v)
      }
    }

    for (let lat = 0; lat < latBands; lat++) {
      for (let lon = 0; lon < lonBands; lon++) {
        const first = lat * (lonBands + 1) + lon
        const second = first + lonBands + 1

        // 反转三角形缠绕顺序以从内部观看
        indices.push(first, second, first + 1)
        indices.push(second, second + 1, first + 1)
      }
    }

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW)

    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    )

    this.sphereBuffers = {
      position: positionBuffer,
      texCoord: texCoordBuffer,
      indices: indexBuffer,
      vertexCount: indices.length
    }
  }

  /**
   * 加载全景图片纹理（支持超大尺寸）
   */
  async _loadTexture() {
    const gl = this.gl

    return new Promise((resolve, reject) => {
      this.texture = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, this.texture)

      // 临时1x1像素
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255])
      )

      const image = new Image()
      image.crossOrigin = 'anonymous'

      image.onload = () => {
        const maxSize = Math.min(
          gl.getParameter(gl.MAX_TEXTURE_SIZE),
          this.maxTextureSize
        )

        let targetImage = image
        const maxDim = Math.max(image.width, image.height)

        // 如果图片太大，缩小处理
        if (maxDim > maxSize) {
          targetImage = this._resizeImage(image, maxSize)
        }

        gl.bindTexture(gl.TEXTURE_2D, this.texture)

        try {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            targetImage
          )

          // 设置纹理参数（不使用mipmap以节省内存）
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

          this.textureLoaded = true
          resolve()
        } catch (e) {
          reject('纹理上传失败: ' + e.message)
        }
      }

      image.onerror = () => reject('图片加载失败: ' + this.imageUrl)
      image.src = this.imageUrl
    })
  }

  _resizeImage(image, maxSize) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const scale = maxSize / Math.max(image.width, image.height)
    canvas.width = Math.floor(image.width * scale)
    canvas.height = Math.floor(image.height * scale)

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    return canvas
  }

  /**
   * 进入VR模式（懒加载初始化）
   */
  async enterVR() {
    if (this.xrSession) {
      throw new Error('已经在VR模式中')
    }

    // 检查支持
    const supported = await this.isVRSupported()
    if (!supported) {
      throw new Error('设备不支持WebXR VR')
    }

    // 懒加载初始化WebGL
    if (!this.isInitialized) {
      if (!this._initWebGL()) {
        throw new Error('WebGL初始化失败')
      }

      if (!this._initShaders()) {
        throw new Error('着色器初始化失败')
      }

      this._createSphere()
      await this._loadTexture()

      this.isInitialized = true
    }

    // 请求VR会话
    try {
      this.xrSession = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor']
      })
    } catch (e) {
      throw new Error('无法创建VR会话: ' + e.message)
    }

    // 配置XR会话
    this.xrSession.addEventListener('end', () => this._onSessionEnd())

    const glLayer = new XRWebGLLayer(this.xrSession, this.gl, {
      antialias: false,
      depth: true,
      stencil: false,
      alpha: false,
      framebufferScaleFactor: 0.8
    })

    await this.xrSession.updateRenderState({
      baseLayer: glLayer,
      depthNear: 0.1,
      depthFar: 100.0
    })

    try {
      this.xrRefSpace = await this.xrSession.requestReferenceSpace(
        'local-floor'
      )
    } catch (e) {
      this.xrRefSpace = await this.xrSession.requestReferenceSpace('local')
    }

    // 启动渲染循环
    this.xrSession.requestAnimationFrame((time, frame) =>
      this._onXRFrame(time, frame)
    )

    this.onVRStart()
  }

  /**
   * 退出VR模式（并自动销毁资源）
   */
  exitVR() {
    if (this.xrSession) {
      this.xrSession.end()
      // 不依赖事件，直接销毁
      this._cleanup()
    }
  }

  _onSessionEnd() {
    this._cleanup()
  }

  /**
   * 清理VR会话和资源
   */
  _cleanup() {
    // 避免重复清理
    if (!this.xrSession && !this.isInitialized) return

    this.xrSession = null
    this.xrRefSpace = null

    // 触发退出回调
    if (this.isInitialized) {
      this.onVREnd()
    }

    // 自动销毁释放内存
    if (this.autoDestroyOnExit) {
      this.destroy()
    }
  }

  /**
   * VR渲染循环
   */
  _onXRFrame(time, frame) {
    if (!this.xrSession) return

    const session = frame.session
    session.requestAnimationFrame((t, f) => this._onXRFrame(t, f))

    const pose = frame.getViewerPose(this.xrRefSpace)
    if (!pose) return

    const gl = this.gl
    const glLayer = session.renderState.baseLayer

    gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // 为每只眼睛渲染
    for (const view of pose.views) {
      const viewport = glLayer.getViewport(view)
      gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height)

      this._renderScene(view.projectionMatrix, view.transform.inverse.matrix)
    }
  }

  /**
   * 渲染场景
   */
  _renderScene(projectionMatrix, viewMatrix) {
    const gl = this.gl

    if (!this.textureLoaded) return

    gl.useProgram(this.programInfo.program)

    // 位置属性
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereBuffers.position)
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.position,
      3,
      gl.FLOAT,
      false,
      0,
      0
    )
    gl.enableVertexAttribArray(this.programInfo.attribLocations.position)

    // 纹理坐标
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereBuffers.texCoord)
    gl.vertexAttribPointer(
      this.programInfo.attribLocations.texCoord,
      2,
      gl.FLOAT,
      false,
      0,
      0
    )
    gl.enableVertexAttribArray(this.programInfo.attribLocations.texCoord)

    // 索引
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sphereBuffers.indices)

    // Uniform
    gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix
    )
    gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.modelViewMatrix,
      false,
      viewMatrix
    )

    // 纹理
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.uniform1i(this.programInfo.uniformLocations.texture, 0)

    // 绘制
    gl.drawElements(
      gl.TRIANGLES,
      this.sphereBuffers.vertexCount,
      gl.UNSIGNED_SHORT,
      0
    )
  }

  /**
   * 销毁并释放所有资源
   * 可手动调用，也会在退出VR时自动调用
   */
  destroy() {
    if (!this.isInitialized) return // 未初始化则无需清理

    // 退出VR会话
    if (this.xrSession) {
      this.xrSession.end()
    }

    // 释放WebGL资源
    if (this.gl) {
      const gl = this.gl

      // 解绑所有资源
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
      gl.bindTexture(gl.TEXTURE_2D, null)
      gl.useProgram(null)

      // 删除资源
      if (this.texture) {
        gl.deleteTexture(this.texture)
        this.texture = null
      }

      if (this.sphereBuffers) {
        gl.deleteBuffer(this.sphereBuffers.position)
        gl.deleteBuffer(this.sphereBuffers.texCoord)
        gl.deleteBuffer(this.sphereBuffers.indices)
        this.sphereBuffers = null
      }

      if (this.shaderProgram) {
        gl.deleteProgram(this.shaderProgram)
        this.shaderProgram = null
      }
    }

    // 监听上下文丢失事件,在回调中移除canvas
    if (this.canvas) {
      const canvasId = this.canvasId
      const canvas = this.canvas

      const handleContextLost = event => {
        event.preventDefault()

        // 上下文已丢失,现在可以安全移除canvas
        const canvasElement = document.getElementById(canvasId)
        if (canvasElement && canvasElement.parentNode) {
          canvasElement.parentNode.removeChild(canvasElement)
        }

        // 清理事件监听器
        canvas.removeEventListener('webglcontextlost', handleContextLost)
      }

      this.canvas.addEventListener('webglcontextlost', handleContextLost)

      // 触发上下文丢失
      if (this.gl) {
        const loseContext = this.gl.getExtension('WEBGL_lose_context')
        if (loseContext) {
          loseContext.loseContext()
        }
      }
    }

    // 重置所有状态
    this.gl = null
    this.canvas = null
    this.programInfo = null
    this.textureLoaded = false
    this.isInitialized = false
    this.xrSession = null
    this.xrRefSpace = null
  }
}

// 导出
export default VREquirectangularViewer
