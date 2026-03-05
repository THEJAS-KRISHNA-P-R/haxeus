"use client";

// PERFORMANCE OPTIMIZED FOR MOBILE + DESKTOP
// Based on portfolio implementation: tanh tonemapping, visualViewport,
// denser dual-flow shader, strict quality tiers, 30 FPS mobile cap.

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import './LightPillar.css';

interface LightPillarProps {
    topColor?: string;
    bottomColor?: string;
    intensity?: number;
    rotationSpeed?: number;
    interactive?: boolean;
    className?: string;
    glowAmount?: number;
    pillarWidth?: number;
    pillarHeight?: number;
    noiseIntensity?: number;
    mixBlendMode?: React.CSSProperties['mixBlendMode'];
    pillarRotation?: number;
    quality?: 'low' | 'medium' | 'high';
}

const LightPillar: React.FC<LightPillarProps> = ({
    topColor = '#5227FF',
    bottomColor = '#FF9FFC',
    intensity = 1.0,
    rotationSpeed = 0.3,
    interactive = false,
    className = '',
    glowAmount = 0.01,
    pillarWidth = 3.0,
    pillarHeight = 0.4,
    noiseIntensity = 0.5,
    mixBlendMode = 'screen',
    pillarRotation = 0,
    quality = 'high'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const materialRef = useRef<THREE.ShaderMaterial | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
    const timeRef = useRef<number>(0);
    const isVisibleRef = useRef<boolean>(true);
    const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

    useEffect(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            setWebGLSupported(false);
        }
    }, []);

    useEffect(() => {
        if (!containerRef.current || !webGLSupported) return;

        const container = containerRef.current;

        // IntersectionObserver to pause rendering when off-screen
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    isVisibleRef.current = entry.isIntersecting;
                });
            },
            { threshold: 0 }
        );
        observer.observe(container);

        // Pause when browser tab is hidden
        const handleVisibilityChange = () => {
            if (document.hidden) {
                isVisibleRef.current = false;
            } else {
                isVisibleRef.current = true;
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // PERFORMANCE OPTIMIZED FOR MOBILE — Force container to fill viewport if height is 0
        if (container.clientHeight === 0) {
            container.style.height = '100dvh';
        }
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        // PERFORMANCE OPTIMIZED FOR MOBILE — strict detection: UA + viewport width + touch
        const isMobile =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.innerWidth < 768
            || 'ontouchstart' in window;
        const isLowEndDevice = isMobile || (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4);

        let effectiveQuality = quality;
        if (isLowEndDevice && quality === 'high') effectiveQuality = 'medium';
        if (isMobile && quality !== 'low') effectiveQuality = 'low';

        // PERFORMANCE OPTIMIZED FOR MOBILE — pixelRatio 0.5 hardcoded on mobile (NOT devicePixelRatio)
        // waveIterations must be >= 2 to produce visible turbulence/swirl (1 = flat blob)
        const qualitySettings = {
            low: { iterations: 38, waveIterations: 2, pixelRatio: 0.5, precision: 'mediump', stepMultiplier: 1.3 },
            medium: { iterations: 50, waveIterations: 3, pixelRatio: 0.65, precision: 'mediump', stepMultiplier: 1.1 },
            high: { iterations: 65, waveIterations: 5, pixelRatio: Math.min(1.2, window.devicePixelRatio), precision: 'highp', stepMultiplier: 1.0 }
        };

        const settings = qualitySettings[effectiveQuality] || qualitySettings.medium;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        cameraRef.current = camera;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({
                antialias: false,
                alpha: true,
                powerPreference: effectiveQuality === 'high' ? 'high-performance' : 'low-power',
                precision: settings.precision as 'highp' | 'mediump' | 'lowp',
                stencil: false,
                depth: false
            });
        } catch {
            setWebGLSupported(false);
            return;
        }

        renderer.setSize(width, height);
        renderer.setPixelRatio(settings.pixelRatio);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const parseColor = (hex: string): THREE.Vector3 => {
            const color = new THREE.Color(hex);
            return new THREE.Vector3(color.r, color.g, color.b);
        };

        const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

        const fragmentShader = `
      precision ${settings.precision} float;

      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec3 uTopColor;
      uniform vec3 uBottomColor;
      uniform float uIntensity;
      uniform bool uInteractive;
      uniform float uGlowAmount;
      uniform float uPillarWidth;
      uniform float uPillarHeight;
      uniform float uNoiseIntensity;
      uniform float uRotCos;
      uniform float uRotSin;
      uniform float uPillarRotCos;
      uniform float uPillarRotSin;
      uniform float uWaveSin;
      uniform float uWaveCos;
      varying vec2 vUv;

      const float STEP_MULT = ${settings.stepMultiplier.toFixed(1)};
      const int MAX_ITER = ${settings.iterations};
      const int WAVE_ITER = ${settings.waveIterations};

      void main() {
        vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
        uv = vec2(uPillarRotCos * uv.x - uPillarRotSin * uv.y, uPillarRotSin * uv.x + uPillarRotCos * uv.y);

        vec3 ro = vec3(0.0, 0.0, -10.0);
        vec3 rd = normalize(vec3(uv, 1.0));

        float rotC = uRotCos;
        float rotS = uRotSin;
        if(uInteractive && (uMouse.x != 0.0 || uMouse.y != 0.0)) {
          float a = uMouse.x * 6.283185;
          rotC = cos(a);
          rotS = sin(a);
        }

        vec3 col = vec3(0.0);
        float t = 0.1;

        for(int i = 0; i < MAX_ITER; i++) {
          vec3 p = ro + rd * t;
          p.xz = vec2(rotC * p.x - rotS * p.z, rotS * p.x + rotC * p.z);

          vec3 q = p;
          q.y = p.y * uPillarHeight + uTime;

          // DENSER — extra per-octave swirl rotation for organic smoke turbulence
          float freq = 1.0;
          float amp  = 1.0;
          for(int j = 0; j < WAVE_ITER; j++) {
            q.xz = vec2(uWaveCos * q.x - uWaveSin * q.z,
                        uWaveSin * q.x + uWaveCos * q.z);
            q += cos(q.zxy * freq - uTime * float(j) * 1.2) * amp;
            // Per-octave swirl keyed to time for extra turbulence
            float sw = uTime * 0.06 * float(j + 1);
            float sc = cos(sw); float ss = sin(sw);
            q.xz = vec2(sc * q.x - ss * q.z, ss * q.x + sc * q.z);
            freq *= 2.1;
            amp  *= 0.5;
          }

          // DENSER — triple overlapping SDF flows (union fills screen with complex shape)
          float d1 = length(cos(q.xz * 1.0)) - 0.18;
          float d2 = length(cos(q.xz * 0.65 + vec2(0.75, 0.4))) - 0.22;
          float d  = min(d1, d2);

          float bound = length(p.xz) - uPillarWidth;
          float k = 4.0;
          float h = max(k - abs(d - bound), 0.0);
          d = max(d, bound) + h * h * 0.0625 / k;
          d = abs(d) * 0.09 + 0.006;

          float grad = clamp((15.0 - p.y) / 30.0, 0.0, 1.0);
          col += mix(uBottomColor, uTopColor, grad) / d;

          t += d * STEP_MULT;
          if(t > 50.0) break;
        }

        float widthNorm = uPillarWidth / 3.0;
        // tanh tonemapping — matches portfolio exactly (smoother + denser glow than Reinhard)
        col = tanh(col * uGlowAmount / widthNorm);

        // Dithering grain to break colour banding
        col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;

        gl_FragColor = vec4(col * uIntensity, 1.0);
      }
    `;

        const pillarRotRad = (pillarRotation * Math.PI) / 180;
        const waveSin = Math.sin(0.4);
        const waveCos = Math.cos(0.4);

        const material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(width, height) },
                uMouse: { value: mouseRef.current },
                uTopColor: { value: parseColor(topColor) },
                uBottomColor: { value: parseColor(bottomColor) },
                uIntensity: { value: intensity },
                uInteractive: { value: interactive },
                uGlowAmount: { value: glowAmount },
                uPillarWidth: { value: pillarWidth },
                uPillarHeight: { value: pillarHeight },
                uNoiseIntensity: { value: noiseIntensity },
                uRotCos: { value: 1.0 },
                uRotSin: { value: 0.0 },
                uPillarRotCos: { value: Math.cos(pillarRotRad) },
                uPillarRotSin: { value: Math.sin(pillarRotRad) },
                uWaveSin: { value: waveSin },
                uWaveCos: { value: waveCos }
            },
            transparent: true,
            depthWrite: false,
            depthTest: false
        });
        materialRef.current = material;

        const geometry = new THREE.PlaneGeometry(2, 2);
        geometryRef.current = geometry;
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        let mouseMoveTimeout: number | null = null;
        const handleMouseMove = (event: MouseEvent) => {
            if (!interactive) return;

            if (mouseMoveTimeout) return;

            mouseMoveTimeout = window.setTimeout(() => {
                mouseMoveTimeout = null;
            }, 16);

            const rect = container.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            mouseRef.current.set(x, y);
        };

        if (interactive) {
            container.addEventListener('mousemove', handleMouseMove, { passive: true });
        }

        let lastTime = performance.now();
        const targetFPS = effectiveQuality === 'low' ? 30 : 60;
        const frameTime = 1000 / targetFPS;

        const animate = (currentTime: number) => {
            if (!materialRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;

            if (isVisibleRef.current) {
                const deltaTime = Math.min(currentTime - lastTime, 100); // Caps delta to avoid jumps

                if (deltaTime >= frameTime) {
                    // Fixed 16 ms tick keeps animation identical regardless of FPS tier
                    timeRef.current += 0.016 * rotationSpeed;
                    const t = timeRef.current;
                    materialRef.current.uniforms.uTime.value = t;
                    materialRef.current.uniforms.uRotCos.value = Math.cos(t * 0.3);
                    materialRef.current.uniforms.uRotSin.value = Math.sin(t * 0.3);
                    rendererRef.current.render(sceneRef.current, cameraRef.current);
                    lastTime = currentTime - (deltaTime % frameTime);
                }
            } else {
                // Keep lastTime updated so when it becomes visible again it doesn't jump
                lastTime = currentTime;
            }

            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);

        // PERFORMANCE OPTIMIZED FOR MOBILE — visualViewport handles iOS Safari URL-bar resize
        let resizeTimeout: number | null = null;
        const handleResize = () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = window.setTimeout(() => {
                if (!rendererRef.current || !materialRef.current || !containerRef.current) return;
                const vp = window.visualViewport;
                const newWidth = vp ? vp.width : (containerRef.current.clientWidth || window.innerWidth);
                const newHeight = vp ? vp.height : (containerRef.current.clientHeight || window.innerHeight);
                rendererRef.current.setSize(newWidth, newHeight);
                materialRef.current.uniforms.uResolution.value.set(newWidth, newHeight);
            }, 150);
        };

        window.addEventListener('resize', handleResize, { passive: true });
        window.visualViewport?.addEventListener('resize', handleResize, { passive: true });

        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('resize', handleResize);
            window.visualViewport?.removeEventListener('resize', handleResize);
            if (interactive) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current.forceContextLoss();
                if (container.contains(rendererRef.current.domElement)) {
                    container.removeChild(rendererRef.current.domElement);
                }
            }
            if (materialRef.current) {
                materialRef.current.dispose();
            }
            if (geometryRef.current) {
                geometryRef.current.dispose();
            }

            rendererRef.current = null;
            materialRef.current = null;
            sceneRef.current = null;
            cameraRef.current = null;
            geometryRef.current = null;
            rafRef.current = null;
        };
    }, [
        topColor,
        bottomColor,
        intensity,
        rotationSpeed,
        interactive,
        glowAmount,
        pillarWidth,
        pillarHeight,
        noiseIntensity,
        pillarRotation,
        webGLSupported,
        quality
    ]);

    if (!webGLSupported) {
        return (
            <div className={`light-pillar-fallback ${className}`} style={{ mixBlendMode }}>
                WebGL not supported
            </div>
        );
    }

    return <div ref={containerRef} className={`light-pillar-container ${className}`} style={{ mixBlendMode }} />;
};

export { LightPillar };
export default LightPillar;
