"use client";

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
    topColor = '#b0b0b0',
    bottomColor = '#000000',
    intensity = 1.0,
    rotationSpeed = 0.1,
    interactive = false,
    className = '',
    glowAmount = 0.004,
    pillarWidth = 7.5,
    pillarHeight = 0.6,
    noiseIntensity = 0.0,
    mixBlendMode = 'screen',
    pillarRotation = 235,
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
        try {
            const c = document.createElement('canvas');
            if (!c.getContext('webgl') && !c.getContext('experimental-webgl')) setWebGLSupported(false);
        } catch { setWebGLSupported(false); }
    }, []);

    useEffect(() => {
        if (!containerRef.current || !webGLSupported) return;
        const container = containerRef.current;

        // CRITICAL: read from visualViewport — container.clientWidth is 0 inside position:fixed at mount
        const vp = window.visualViewport;
        const width = vp ? Math.floor(vp.width) : window.innerWidth;
        const height = vp ? Math.floor(vp.height) : window.innerHeight;

        // Pause when tab hidden
        const handleVisibility = () => { isVisibleRef.current = !document.hidden; };
        document.addEventListener('visibilitychange', handleVisibility);

        // Pause when off-screen
        const observer = new IntersectionObserver(
            ([e]) => { isVisibleRef.current = e.isIntersecting && !document.hidden; },
            { threshold: 0 }
        );
        observer.observe(container);

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            || window.innerWidth < 768;

        let effectiveQuality = quality;
        if (isMobile && quality !== 'low') effectiveQuality = 'low';

        const qualitySettings = {
            low: { iterations: 28, waveIterations: 2, pixelRatio: 0.5, precision: 'mediump', stepMultiplier: 1.5 },
            medium: { iterations: 50, waveIterations: 3, pixelRatio: 0.65, precision: 'mediump', stepMultiplier: 1.2 },
            high: { iterations: 80, waveIterations: 4, pixelRatio: Math.min(window.devicePixelRatio, 1.5), precision: 'highp', stepMultiplier: 1.0 },
        };
        const s = qualitySettings[effectiveQuality] || qualitySettings.medium;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        cameraRef.current = camera;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({
                antialias: false, alpha: true,
                powerPreference: effectiveQuality === 'low' ? 'low-power' : 'high-performance',
                precision: s.precision as 'highp' | 'mediump' | 'lowp',
                stencil: false, depth: false,
            });
        } catch { setWebGLSupported(false); return; }

        renderer.setSize(width, height);
        renderer.setPixelRatio(s.pixelRatio);
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const parseColor = (hex: string) => {
            // Handle 8-digit hex strings (RGBA) by stripping the alpha
            const cleanHex = hex.length === 9 ? hex.slice(0, 7) : hex;
            const c = new THREE.Color(cleanHex);
            return new THREE.Vector3(c.r, c.g, c.b);
        };

        const vertexShader = `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `;

        const fragmentShader = `
      precision ${s.precision} float;
      uniform float uTime;
      uniform vec2  uResolution;
      uniform vec2  uMouse;
      uniform vec3  uTopColor;
      uniform vec3  uBottomColor;
      uniform float uIntensity;
      uniform bool  uInteractive;
      uniform float uGlowAmount;
      uniform float uPillarWidth;
      uniform float uPillarHeight;
      uniform float uNoiseIntensity;
      uniform float uRotCos;
      uniform float uRotSin;
      uniform float uPillarRotCos;
      uniform float uPillarRotSin;
      uniform float uWaveSin[4];
      uniform float uWaveCos[4];
      varying vec2 vUv;

      const float PI      = 3.141592653589793;
      const float EPSILON = 0.001;
      const float E       = 2.71828182845904523536;

      float noise(vec2 coord) {
        vec2 r = (E * sin(E * coord));
        return fract(r.x * r.y * (1.0 + coord.x));
      }

      const int   ITERATIONS      = ${s.iterations};
      const int   WAVE_ITERATIONS = ${s.waveIterations};
      const float STEP_MULT       = ${s.stepMultiplier.toFixed(1)};

      void main() {
        vec2 fragCoord = vUv * uResolution;
        vec2 uv = (fragCoord * 2.0 - uResolution) / uResolution.y;

        uv = vec2(
          uv.x * uPillarRotCos - uv.y * uPillarRotSin,
          uv.x * uPillarRotSin + uv.y * uPillarRotCos
        );

        vec3  origin    = vec3(0.0, 0.0, -10.0);
        vec3  direction = normalize(vec3(uv, 1.0));
        float rotCos    = uRotCos;
        float rotSin    = uRotSin;

        if (uInteractive && length(uMouse) > 0.0) {
          float a = uMouse.x * PI * 2.0;
          rotCos = cos(a); rotSin = sin(a);
        }

        vec3  color = vec3(0.0);
        float depth = 0.1;

        for (int i = 0; i < ITERATIONS; i++) {
          vec3 pos = origin + direction * depth;
          float nx = pos.x * rotCos - pos.z * rotSin;
          float nz = pos.x * rotSin + pos.z * rotCos;
          pos.x = nx; pos.z = nz;

          vec3  deformed = pos;
          deformed.y     = deformed.y * uPillarHeight + uTime;

          float freq = 1.0;
          float amp  = 1.0;
          for (int j = 0; j < WAVE_ITERATIONS; j++) {
            float wx = deformed.x * uWaveCos[j] - deformed.z * uWaveSin[j];
            float wz = deformed.x * uWaveSin[j] + deformed.z * uWaveCos[j];
            deformed.x = wx; deformed.z = wz;
            deformed += cos(deformed.zxy * freq - uTime * float(j) * 2.0) * amp;
            freq *= 2.0; amp *= 0.5;
          }

          float fieldDistance = length(cos(deformed.xz)) - 0.2;
          float radialBound   = length(pos.xz) - uPillarWidth;
          float k = 4.0;
          float h = max(k - abs(-radialBound - (-fieldDistance)), 0.0);
          fieldDistance = -(min(-radialBound, -fieldDistance) - h * h * 0.25 / k);
          fieldDistance = abs(fieldDistance) * 0.15 + 0.01;

          vec3 gradient = mix(uBottomColor, uTopColor, smoothstep(15.0, -15.0, pos.y));
          color += gradient / fieldDistance;

          if (fieldDistance < EPSILON || depth > 50.0) break;
          depth += fieldDistance * STEP_MULT;
        }

        float widthNorm = uPillarWidth / 3.0;
        color = tanh(color * uGlowAmount / widthNorm);
        float rnd = noise(gl_FragCoord.xy);
        color -= rnd / 15.0 * uNoiseIntensity;
        gl_FragColor = vec4(color * uIntensity, 1.0);
      }
    `;

        const waveAngle = 0.4;
        const waveSinVals = new Float32Array(4).fill(Math.sin(waveAngle));
        const waveCosVals = new Float32Array(4).fill(Math.cos(waveAngle));
        const pillarRotRad = (pillarRotation * Math.PI) / 180;

        const material = new THREE.ShaderMaterial({
            vertexShader, fragmentShader,
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
                uWaveSin: { value: waveSinVals },
                uWaveCos: { value: waveCosVals },
            },
            transparent: true, depthWrite: false, depthTest: false,
        });
        materialRef.current = material;

        const geometry = new THREE.PlaneGeometry(2, 2);
        geometryRef.current = geometry;
        scene.add(new THREE.Mesh(geometry, material));

        if (interactive) {
            container.addEventListener('mousemove', (e: MouseEvent) => {
                const rect = container.getBoundingClientRect();
                mouseRef.current.set(
                    ((e.clientX - rect.left) / rect.width) * 2 - 1,
                    -((e.clientY - rect.top) / rect.height) * 2 + 1
                );
            }, { passive: true });
        }

        let lastTime = performance.now();
        const fps = effectiveQuality === 'low' ? 30 : 60;
        const frame = 1000 / fps;

        const animate = (now: number) => {
            rafRef.current = requestAnimationFrame(animate);
            if (!isVisibleRef.current) { lastTime = now; return; }
            const delta = now - lastTime;
            if (delta < frame) return;
            lastTime = now - (delta % frame);
            timeRef.current += 0.016 * rotationSpeed;
            const t = timeRef.current;
            material.uniforms.uTime.value = t;
            material.uniforms.uRotCos.value = Math.cos(t * 0.3);
            material.uniforms.uRotSin.value = Math.sin(t * 0.3);
            renderer.render(scene, camera);
        };
        rafRef.current = requestAnimationFrame(animate);

        let resizeTimer: ReturnType<typeof setTimeout> | null = null;
        const handleResize = () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (!rendererRef.current || !materialRef.current) return;
                const v = window.visualViewport;
                const newW = v ? Math.floor(v.width) : window.innerWidth;
                const newH = v ? Math.floor(v.height) : window.innerHeight;
                rendererRef.current.setSize(newW, newH);
                materialRef.current.uniforms.uResolution.value.set(newW, newH);
            }, 150);
        };
        window.addEventListener('resize', handleResize, { passive: true });
        window.visualViewport?.addEventListener('resize', handleResize, { passive: true });

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
            window.visualViewport?.removeEventListener('resize', handleResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current.forceContextLoss();
                if (container.contains(rendererRef.current.domElement))
                    container.removeChild(rendererRef.current.domElement);
            }
            material.dispose();
            geometry.dispose();
            rendererRef.current = null; materialRef.current = null;
            sceneRef.current = null; cameraRef.current = null;
            geometryRef.current = null; rafRef.current = null;
        };
    }, [topColor, bottomColor, intensity, rotationSpeed, interactive,
        glowAmount, pillarWidth, pillarHeight, noiseIntensity,
        pillarRotation, webGLSupported, quality]);

    if (!webGLSupported) {
        return <div className={`light-pillar-fallback ${className}`} style={{ mixBlendMode }} />;
    }

    return (
        <div
            ref={containerRef}
            className={`light-pillar-container ${className}`}
            style={{ mixBlendMode }}
        />
    );
};

export { LightPillar };
export default LightPillar;
