"use client";

import React, { useRef, useEffect, useState } from 'react';

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

const LightPillarMobile: React.FC<LightPillarProps> = ({
    topColor = '#e93a3a',
    bottomColor = '#000000',
    intensity = 1.0,
    rotationSpeed = 0.1,
    interactive = false,
    className = '',
    glowAmount = 0.004,
    pillarWidth = 9.0,
    pillarHeight = 0.6,
    noiseIntensity = 0.0,
    mixBlendMode = 'screen',
    pillarRotation = 55,
    quality = 'high'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const isVisibleRef = useRef<boolean>(true);
    const cleanupRef = useRef<(() => void) | null>(null);
    const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

    useEffect(() => {
        // Test WebGL support
        try {
            const testCanvas = document.createElement('canvas');
            const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
            if (!gl) { setWebGLSupported(false); return; }
        } catch { setWebGLSupported(false); return; }

        // CRITICAL: Get dimensions from visualViewport, never from container
        // Container may report 0x0 at mount time inside a fixed wrapper
        const vp = window.visualViewport;
        const width = Math.floor(vp ? vp.width : window.innerWidth);
        const height = Math.floor(vp ? vp.height : window.innerHeight);

        if (width === 0 || height === 0) {
            // Retry after browser paint
            const retryId = window.setTimeout(() => {
                setWebGLSupported(prev => prev); // force re-render to retry
            }, 100);
            return () => window.clearTimeout(retryId);
        }

        const container = containerRef.current;
        if (!container) return;

        // Quality settings — mobile is always low/medium, never high
        const qualityMap = {
            low: { iterations: 20, waveIterations: 2, pixelRatio: 0.5, precision: 'mediump', stepMult: 2.0 },
            medium: { iterations: 30, waveIterations: 2, pixelRatio: 0.6, precision: 'mediump', stepMult: 1.5 },
            high: { iterations: 38, waveIterations: 5, pixelRatio: 0.75, precision: 'mediump', stepMult: 1.2 },
        };
        const s = qualityMap[quality] || qualityMap.low;

        // ----- THREE.JS setup (imported dynamically to avoid SSR issues) -----
        // We use raw WebGL here to avoid Three.js bundle size on mobile
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(width * s.pixelRatio);
        canvas.height = Math.floor(height * s.pixelRatio);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        if (window.innerWidth <= 768) {
            canvas.style.imageRendering = 'pixelated';
        }
        container.appendChild(canvas);

        const gl = canvas.getContext('webgl', {
            alpha: true,
            antialias: false,
            powerPreference: 'low-power',
            depth: false,
            stencil: false,
            premultipliedAlpha: false,
        }) as WebGLRenderingContext | null;

        if (!gl) {
            setWebGLSupported(false);
            container.removeChild(canvas);
            return;
        }

        const pillarRotRad = (pillarRotation * Math.PI) / 180;
        const waveSin = Math.sin(0.4);
        const waveCos = Math.cos(0.4);

        // Vertex shader
        const vsSource = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

        // Fragment shader — optimized for mobile
        const fsSource = `
precision ${gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT)?.precision ? 'highp' : 'mediump'} float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform float uIntensity;
uniform float uGlowAmount;
uniform float uPillarWidth;
uniform float uPillarHeight;
uniform float uPillarRotCos;
uniform float uPillarRotSin;
uniform float uWaveSin;
uniform float uWaveCos;
uniform float uRotCos;
uniform float uRotSin;
uniform float uAspect;
varying vec2 vUv;

const int MAX_ITER  = ${s.iterations};
const int WAVE_ITER = ${s.waveIterations};
const float STEP    = ${s.stepMult.toFixed(1)};

// Tanh approximation for WebGL 1.0 (mobile)
// tanh(x) = (exp(2x) - 1) / (exp(2x) + 1)
vec3 fast_tanh(vec3 x) {
    vec3 e = exp(2.0 * x);
    return (e - 1.0) / (e + 1.0);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    uv = uAspect < 1.0
        ? uv * vec2(1.0, 1.0 / uAspect)
        : uv * vec2(uAspect, 1.0);
    uv = vec2(uPillarRotCos * uv.x - uPillarRotSin * uv.y,
              uPillarRotSin * uv.x + uPillarRotCos * uv.y);

    vec3 ro = vec3(0.0, 0.0, -10.0);
    vec3 rd = normalize(vec3(uv, 1.0));

    vec3 col = vec3(0.0);
    float t = 0.1;

    for (int i = 0; i < MAX_ITER; i++) {
        vec3 p = ro + rd * t;
        p.xz = vec2(uRotCos * p.x - uRotSin * p.z,
                    uRotSin * p.x + uRotCos * p.z);

        vec3 q = p;
        q.y = p.y * uPillarHeight + uTime;

        float freq = 1.0;
        float amp  = 1.0;
        for (int j = 0; j < WAVE_ITER; j++) {
            q.xz = vec2(uWaveCos * q.x - uWaveSin * q.z,
                        uWaveSin * q.x + uWaveCos * q.z);
            q += cos(q.zxy * freq - uTime * float(j) * 1.2) * amp;
            freq *= 2.1;
            amp  *= 0.5;
        }

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

        t += d * STEP;
        if (t > 50.0) break;
    }

    float widthNorm = uPillarWidth / 3.0;
    
    // PC alignment: use tanh instead of simplistic division
    // This preserves color balance better (teal stays teal)
    col = fast_tanh(col * uGlowAmount / widthNorm);

    gl_FragColor = vec4(col * uIntensity, 1.0);
}`;

        // Compile shader helper
        const compileShader = (type: number, src: string): WebGLShader | null => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vs = compileShader(gl.VERTEX_SHADER, vsSource);
        const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
        if (!vs || !fs) { setWebGLSupported(false); return; }

        const program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            setWebGLSupported(false);
            return;
        }
        gl.useProgram(program);

        // Fullscreen quad
        const quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1,
            1, -1, 1, 1, -1, 1,
        ]), gl.STATIC_DRAW);
        const aPos = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        // Uniforms
        const uTime = gl.getUniformLocation(program, 'uTime');
        const uResolution = gl.getUniformLocation(program, 'uResolution');
        const uTopColor = gl.getUniformLocation(program, 'uTopColor');
        const uBottomColor = gl.getUniformLocation(program, 'uBottomColor');
        const uIntensity = gl.getUniformLocation(program, 'uIntensity');
        const uGlowAmount = gl.getUniformLocation(program, 'uGlowAmount');
        const uPillarWidth = gl.getUniformLocation(program, 'uPillarWidth');
        const uPillarHeight = gl.getUniformLocation(program, 'uPillarHeight');
        const uPillarRotCos = gl.getUniformLocation(program, 'uPillarRotCos');
        const uPillarRotSin = gl.getUniformLocation(program, 'uPillarRotSin');
        const uWaveSin = gl.getUniformLocation(program, 'uWaveSin');
        const uWaveCos = gl.getUniformLocation(program, 'uWaveCos');
        const uRotCos = gl.getUniformLocation(program, 'uRotCos');
        const uRotSin = gl.getUniformLocation(program, 'uRotSin');
        const uAspect = gl.getUniformLocation(program, 'uAspect');

        // Parse color hex → [r, g, b] 0..1
        const hexToRgb = (hex: string): [number, number, number] => {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            return [r, g, b];
        };

        const [tr, tg, tb] = hexToRgb(topColor);
        const [br, bg, bb] = hexToRgb(bottomColor);

        gl.uniform2f(uResolution, width, height);
        gl.uniform3f(uTopColor, tr, tg, tb);
        gl.uniform3f(uBottomColor, br, bg, bb);
        gl.uniform1f(uIntensity, intensity);
        gl.uniform1f(uGlowAmount, glowAmount);
        gl.uniform1f(uPillarWidth, pillarWidth);
        gl.uniform1f(uPillarHeight, pillarHeight);
        gl.uniform1f(uPillarRotCos, Math.cos(pillarRotRad));
        gl.uniform1f(uPillarRotSin, Math.sin(pillarRotRad));
        gl.uniform1f(uWaveSin, waveSin);
        gl.uniform1f(uWaveCos, waveCos);
        gl.uniform1f(uAspect, width / height);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        let time = 0;
        let lastTimestamp = performance.now();
        const frameTime = 1000 / 30; // 30 FPS on mobile

        // Visibility / tab pause
        const handleVisibility = () => { isVisibleRef.current = !document.hidden; };
        document.addEventListener('visibilitychange', handleVisibility);

        const animate = (now: number) => {
            rafRef.current = requestAnimationFrame(animate);
            if (!isVisibleRef.current) { lastTimestamp = now; return; }

            const delta = Math.min(now - lastTimestamp, 100);
            if (delta < frameTime) return;
            lastTimestamp = now - (delta % frameTime);

            time += 0.016 * rotationSpeed;
            gl.uniform1f(uTime, time);
            gl.uniform1f(uRotCos, Math.cos(time * 0.3));
            gl.uniform1f(uRotSin, Math.sin(time * 0.3));
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
        rafRef.current = requestAnimationFrame(animate);

        // Resize — re-read from visualViewport
        let resizeTimer: number | null = null;
        const handleResize = () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                const vp2 = window.visualViewport;
                const cssW = Math.floor(vp2 ? vp2.width : window.innerWidth);
                const cssH = Math.floor(vp2 ? vp2.height : window.innerHeight);
                const w = Math.floor(cssW * s.pixelRatio);
                const h = Math.floor(cssH * s.pixelRatio);
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
                gl.uniform2f(uResolution, cssW, cssH);
                gl.uniform1f(uAspect, cssW / cssH);
            }, 150);
        };
        window.addEventListener('resize', handleResize, { passive: true });
        window.visualViewport?.addEventListener('resize', handleResize, { passive: true });

        // IntersectionObserver — pause when scrolled off screen
        const observer = new IntersectionObserver(
            ([e]) => { isVisibleRef.current = e.isIntersecting && !document.hidden; },
            { threshold: 0 }
        );
        observer.observe(container);

        cleanupRef.current = () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('resize', handleResize);
            window.visualViewport?.removeEventListener('resize', handleResize);
            observer.disconnect();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            gl.deleteProgram(program);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteBuffer(quadBuffer);
            if (container.contains(canvas)) container.removeChild(canvas);
        };

        return () => { cleanupRef.current?.(); };
    }, [topColor, bottomColor, intensity, rotationSpeed, glowAmount,
        pillarWidth, pillarHeight, pillarRotation, quality, webGLSupported]);

    if (!webGLSupported) {
        return (
            <div
                className={className}
                style={{
                    mixBlendMode,
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(ellipse 80% 60% at 55% 40%,
                        rgba(180,0,0,0.6) 0%, rgba(100,0,0,0.35) 40%,
                        rgba(30,0,0,0.2) 70%, transparent 100%)`,
                }}
            />
        );
    }

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                mixBlendMode,
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                pointerEvents: 'none',
            }}
        />
    );
};

export default LightPillarMobile;
