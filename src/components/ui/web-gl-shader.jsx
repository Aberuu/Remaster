/* eslint-disable */
import { useEffect, useRef } from "react"
import * as THREE from "three"

const hexToVec3 = (hex) => {
  const h = hex.replace("#", "")
  const n = parseInt(h, 16)
  return new THREE.Color(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

export function WebGLShader({
  className = "fixed top-0 left-0 w-full h-full block pointer-events-none -z-10",
  active = true,
  wipeActive = false,
  waveActive = true,
  progress = null,
  duration = 1400,
  colors = ["#39ff14", "#00b4ff"],
}) {
  const canvasRef = useRef(null)
  const activeRef = useRef(active)
  const wipeRef = useRef(wipeActive)
  const waveRef = useRef(waveActive)
  const progressRefPassed = useRef(progress)
  const colorARef = useRef(hexToVec3(colors[0]))
  const colorBRef = useRef(hexToVec3(colors[1]))

  useEffect(() => { activeRef.current = active }, [active])
  useEffect(() => { wipeRef.current = wipeActive }, [wipeActive])
  useEffect(() => { waveRef.current = waveActive }, [waveActive])
  useEffect(() => { progressRefPassed.current = progress }, [progress])
  useEffect(() => { colorARef.current = hexToVec3(colors[0]) }, [colors, colors[0]])
  useEffect(() => { colorBRef.current = hexToVec3(colors[1]) }, [colors, colors[1]])

  const refs = useRef({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    uniforms: null,
    animationId: null,
    blanked: true,
  })

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const S = refs.current

    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;
      uniform float uWipe;
      uniform float uWave;
      uniform float progress;
      uniform float gridX;
      uniform float gridY;
      uniform vec3 colorA;
      uniform vec3 colorB;

      float hash(float n) {
        return fract(sin(n) * 43758.5453123);
      }

      void main() {
        float px = gl_FragCoord.x / resolution.x;
        float py = gl_FragCoord.y / resolution.y;

        vec3 col = vec3(0.0);
        float alpha = 0.0;

        // Idle + glow: living-wave background
        if (uWave > 0.5) {
          vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
          float d = length(p) * distortion;
          float rx = p.x * (1.0 + d);
          float gx = p.x;
          float bx = p.x * (1.0 - d);
          float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
          float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
          float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
          col = vec3(r, g, b);
          alpha = clamp(max(r, max(g, b)) * 1.6, 0.0, 1.0);
        }

        // Shader wipe: ragged pixel neon frontier sweeping left -> right
        if (uWipe > 0.5) {
          float xq = (floor(px / gridX) + 0.5) * gridX;
          float row = floor(py / gridY);

          float f = progress + (hash(row) - 0.5) * 0.05;
          float fade = smoothstep(1.0, 0.84, progress);

          float band = step(xq, f);
          float dist = max(f - xq, 0.0);
          float edgeG = band * (1.0 - smoothstep(0.0, gridX * 1.5, dist));
          float flick = 0.78 + 0.22 * hash(row + floor(time * 16.0));
          float bob = 0.85 + 0.15 * sin(time * 4.0 + row * 0.6);

          vec3 c = colorA * edgeG * 1.2 + colorB * band * 0.5;
          c *= flick * bob * fade;

          // During a wipe back to glow, the living wave stays visible INSIDE
          // the revealed area (masked by the frontier) instead of vanishing.
          if (uWave > 0.5) {
            col *= band;
            alpha *= band;
          }

          col += c;
          alpha = max(alpha, max(c.r, max(c.g, c.b)));
        }

        gl_FragColor = vec4(col, alpha);
      }
    `

    const initScene = () => {
      S.scene = new THREE.Scene()
      S.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: false })
      S.renderer.setPixelRatio(window.innerWidth < 640 ? 1 : Math.min(window.devicePixelRatio || 1, 2))
      S.renderer.setClearColor(0x000000, 0)

      S.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

      S.uniforms = {
        resolution: { value: [window.innerWidth, window.innerHeight] },
        time: { value: 0.0 },
        xScale: { value: 1.0 },
        yScale: { value: 0.5 },
        distortion: { value: 0.05 },
        uWipe: { value: 0.0 },
        uWave: { value: 1.0 },
        progress: { value: 0.0 },
        gridX: { value: 20 / window.innerWidth },
        gridY: { value: 20 / window.innerHeight },
        colorA: { value: hexToVec3("#39ff14") },
        colorB: { value: hexToVec3("#00b4ff") },
      }

      const positions = new THREE.BufferAttribute(
        new Float32Array([
          -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0,
          1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, 1.0, 0.0,
        ]),
        3
      )
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", positions)

      S.mesh = new THREE.Mesh(
        geometry,
        new THREE.RawShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: S.uniforms,
          side: THREE.DoubleSide,
          transparent: true,
        })
      )
      S.scene.add(S.mesh)

      handleResize()
    }

    const handleResize = () => {
      if (!S.renderer || !S.uniforms) return
      const width = window.innerWidth
      const height = window.innerHeight
      S.renderer.setSize(width, height, false)
      S.uniforms.resolution.value = [width, height]
      S.uniforms.gridX.value = 20 / width
      S.uniforms.gridY.value = 20 / height
    }

    const animate = () => {
      if (S.uniforms) {
        S.uniforms.time.value += 0.016
        S.uniforms.progress.value = progressRefPassed.current ? progressRefPassed.current.current : 0
        S.uniforms.uWipe.value = wipeRef.current ? 1 : 0
        S.uniforms.uWave.value = waveRef.current ? 1 : 0
        S.uniforms.colorA.value.copy(colorARef.current)
        S.uniforms.colorB.value.copy(colorBRef.current)
      }
      if (activeRef.current && S.renderer && S.scene && S.camera) {
        S.renderer.render(S.scene, S.camera)
        S.blanked = false
      } else if (!S.blanked && S.renderer && S.scene && S.camera && S.uniforms) {
        // clear stale pixels when hidden
        S.uniforms.uWipe.value = 0
        S.uniforms.uWave.value = 0
        S.renderer.render(S.scene, S.camera)
        S.blanked = true
      }
      S.animationId = requestAnimationFrame(animate)
    }

    initScene()
    animate()
    window.addEventListener("resize", handleResize)

    return () => {
      if (S.animationId) cancelAnimationFrame(S.animationId)
      window.removeEventListener("resize", handleResize)
      if (S.mesh) {
        S.scene?.remove(S.mesh)
        S.mesh.geometry.dispose()
        if (S.mesh.material instanceof THREE.Material) {
          S.mesh.material.dispose()
        }
      }
      S.renderer?.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} />
}