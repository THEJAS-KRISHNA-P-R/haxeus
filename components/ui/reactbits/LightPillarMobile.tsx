"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

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

/**
 * Mobile-specific LightPillar implementation.
 * Extremely optimized for low-end mobile GPUs.
 */
const LightPillarMobile: React.FC<LightPillarProps> = ({
    topColor = '#e93a3a',
    bottomColor = '#000000',
    intensity = 1.0,
    rotationSpeed = 0.1,
    interactive = false,
    className = '',
    glowAmount = 0.002,
    pillarWidth = 9.0,
    pillarHeight = 0.6,
    noiseIntensity = 0.0,
    mixBlendMode = 'screen',
    pillarRotation = 55,
    quality = 'low'
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
        if (!gl) setWebGLSupported(false);
    }, []);

    useEffect(() => {
        if (!containerRef.current || !webGLSupported) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

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

        // Mobile-first quality settings - very conservative
        const qualitySettings = {
            low: { iterations: 12, waveIterations: 1, pixelRatio: 0.5, precision: 'mediump', stepMultiplier: 2.0 },
            medium: { iterations: 20, waveIterations: 2, pixelRatio: 0.6, precision: 'mediump', stepMultiplier: 1.5 },
            high: { iterations: 32, waveIterations: 3, pixelRatio: 0.75, precision: 'mediump', stepMultiplier: 1.2 }
        };

        const settings = qualitySettings[quality] || qualitySettings.low;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        cameraRef.current = camera;

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({
                antialias: false,
                alpha: true,
                powerPreference: 'low-power',
                precision: settings.precision,
                stencil: false,
                depth: false
            });
        } catch (error) {
            console.error('Failed to create WebGL renderer:', error);
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
      uniform float uPillarRotation;
      uniform float uRotCos;
      uniform float uRotSin;
      uniform float uPillarRotCos;
      uniform float uPillarRotSin;
      uniform float uWaveSin[4];
      uniform float uWaveCos[4];
      varying vec2 vUv;

      const float PI = 3.14159265;
      const float EPSILON = 0.01;

      float noise(vec2 coord) {
        return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 fragCoord = vUv * uResolution;
        vec2 uv = (fragCoord * 2.0 - uResolution) / uResolution.y;
        
        uv = vec2(
          uv.x * uPillarRotCos - uv.y * uPillarRotSin,
          uv.x * uPillarRotSin + uv.y * uPillarRotCos
        );

        vec3 origin = vec3(0.0, 0.0, -10.0);
        vec3 direction = normalize(vec3(uv, 1.0));

        float maxDepth = 40.0;
        float depth = 0.1;

        float rotCos = uRotCos;
        float rotSin = uRotSin;

        vec3 color = vec3(0.0);
        
        const int ITERATIONS = ${settings.iterations};
        const int WAVE_ITERATIONS = ${settings.waveIterations};
        const float STEP_MULT = ${settings.stepMultiplier.toFixed(1)};
        
        for(int i = 0; i < ITERATIONS; i++) {
          vec3 pos = origin + direction * depth;
          
          float newX = pos.x * rotCos - pos.z * rotSin;
          float newZ = pos.x * rotSin + pos.z * rotCos;
          pos.x = newX;
          pos.z = newZ;

          vec3 deformed = pos;
          deformed.y *= uPillarHeight;
          deformed = deformed + vec3(0.0, uTime, 0.0);
          
          float frequency = 1.0;
          float amplitude = 1.0;
          for(int j = 0; j < WAVE_ITERATIONS; j++) {
            float wx = deformed.x * uWaveCos[j] - deformed.z * uWaveSin[j];
            float wz = deformed.x * uWaveSin[j] + deformed.z * uWaveCos[j];
            deformed.x = wx;
            deformed.z = wz;
            
            float phase = uTime * float(j) * 1.5;
            vec3 oscillation = cos(deformed.zxy * frequency - phase);
            deformed += oscillation * amplitude;
            frequency *= 2.1;
            amplitude *= 0.45;
          }
          
          vec2 cosinePair = cos(deformed.xz);
          float fieldDistance = length(cosinePair) - 0.2;
          
          float radialBound = length(pos.xz) - uPillarWidth;
          float k = 4.0;
          float h = max(k - abs(-radialBound + fieldDistance), 0.0);
          fieldDistance = (min(radialBound, fieldDistance) + h * h * 0.25 / k);
          
          fieldDistance = abs(fieldDistance) * 0.15 + 0.01;

          vec3 gradient = mix(uBottomColor, uTopColor, smoothstep(15.0, -15.0, pos.y));
          color += gradient / fieldDistance;

          if(depth > maxDepth) break;
          depth += fieldDistance * STEP_MULT;
        }

        float widthNormalization = uPillarWidth / 3.0;
        vec3 finalCol = color * uGlowAmount / widthNormalization;
        finalCol = finalCol / (1.0 + finalCol); // Fast tone mapping
        
        if (uNoiseIntensity > 0.0) {
          finalCol -= noise(gl_FragCoord.xy) / 15.0 * uNoiseIntensity;
        }
        
        gl_FragColor = vec4(finalCol * uIntensity, 1.0);
      }
    `;

        const waveAngle = 0.4;
        const waveSinValues = new Float32Array(4);
        const waveCosValues = new Float32Array(4);
        for (let i = 0; i < 4; i++) {
            waveSinValues[i] = Math.sin(waveAngle);
            waveCosValues[i] = Math.cos(waveAngle);
        }

        const pillarRotRad = (pillarRotation * Math.PI) / 180.0;
        const pillarRotCos = Math.cos(pillarRotRad);
        const pillarRotSin = Math.sin(pillarRotRad);

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
                uPillarRotation: { value: pillarRotation },
                uRotCos: { value: 1.0 },
                uRotSin: { value: 0.0 },
                uPillarRotCos: { value: pillarRotCos },
                uPillarRotSin: { value: pillarRotSin },
                uWaveSin: { value: waveSinValues },
                uWaveCos: { value: waveCosValues }
            },
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending
        });
        materialRef.current = material;

        const geometry = new THREE.PlaneGeometry(2, 2);
        geometryRef.current = geometry;
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        let lastTime = performance.now();
        const frameTime = 1000 / 30; // Force 30fps for mobile stability

        const animate = (currentTime: number) => {
            if (!materialRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
            const deltaTime = currentTime - lastTime;

            if (isVisibleRef.current) {
                if (deltaTime >= frameTime) {
                    timeRef.current += (deltaTime / 1000) * rotationSpeed * 10.0; // Adjust for scale
                    materialRef.current.uniforms.uTime.value = timeRef.current;

                    const rotAngle = timeRef.current * 0.3;
                    materialRef.current.uniforms.uRotCos.value = Math.cos(rotAngle);
                    materialRef.current.uniforms.uRotSin.value = Math.sin(rotAngle);

                    rendererRef.current.render(sceneRef.current, cameraRef.current);
                    lastTime = currentTime - (deltaTime % frameTime);
                }
            } else {
                lastTime = currentTime;
            }
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);

        const handleResize = () => {
            if (!rendererRef.current || !materialRef.current || !containerRef.current) return;
            const newWidth = containerRef.current.clientWidth;
            const newHeight = containerRef.current.clientHeight;
            rendererRef.current.setSize(newWidth, newHeight);
            materialRef.current.uniforms.uResolution.value.set(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (rendererRef.current) {
                rendererRef.current.dispose();
                if (container.contains(rendererRef.current.domElement)) {
                    container.removeChild(rendererRef.current.domElement);
                }
            }
            if (materialRef.current) materialRef.current.dispose();
            if (geometryRef.current) geometryRef.current.dispose();
        };
    }, [
        topColor, bottomColor, intensity, rotationSpeed, interactive,
        glowAmount, pillarWidth, pillarHeight, noiseIntensity, pillarRotation,
        webGLSupported, quality
    ]);

    if (!webGLSupported) return null;

    return (
        <div
            ref={containerRef}
            className={`w-full h-full absolute top-0 left-0 ${className}`}
            style={{ mixBlendMode }}
        />
    );
};

export default LightPillarMobile;
