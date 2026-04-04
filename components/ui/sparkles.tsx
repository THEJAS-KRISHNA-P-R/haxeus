"use client";
import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

type ParticlesProps = {
    id?: string;
    className?: string;
    background?: string;
    particleSize?: number;
    minSize?: number;
    maxSize?: number;
    speed?: number;
    particleColor?: string;
    particleDensity?: number;
};

// Module-level flag — ensures initParticlesEngine runs only once per app lifecycle
let engineInitialized = false;

export const SparklesCore = (props: ParticlesProps) => {
    const {
        id,
        className,
        background,
        minSize,
        maxSize,
        speed,
        particleColor,
        particleDensity,
    } = props;
    const [init, setInit] = useState(false);
    useEffect(() => {
        if (engineInitialized) {
            setInit(true);
            return;
        }
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            engineInitialized = true;
            setInit(true);
        });
    }, []);
    const controls = useAnimation();

    if (!init) return <></>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={controls} className={cn("block w-full h-full", className)}>
            <Particles
                id={id || "tsparticles"}
                className={"h-full w-full"}
                particlesLoaded={async () => {
                    controls.start({
                        opacity: 1,
                        transition: {
                            duration: 1,
                        },
                    });
                }}
                options={{
                    background: {
                        color: {
                            value: background || "transparent",
                        },
                    },
                    fullScreen: {
                        enable: false,
                        zIndex: 1,
                    },

                    fpsLimit: 120,
                    particles: {
                        color: {
                            value: particleColor || "#ffffff",
                        },
                        move: {
                            enable: true,
                            speed: speed || 4,
                            direction: "none",
                            random: true,
                            straight: false,
                            outModes: "out",
                        },
                        number: {
                            density: {
                                enable: true,
                            },
                            value: particleDensity || 120,
                        },
                        opacity: {
                            value: { min: 0.1, max: 1 },
                            animation: {
                                enable: true,
                                speed: speed || 4,
                                sync: false,
                            },
                        },
                        size: {
                            value: { min: minSize || 1, max: maxSize || 3 },
                            animation: {
                                enable: true,
                                speed: speed || 4,
                                sync: false,
                            },
                        },
                    },
                    detectRetina: true,
                }}
            />
        </motion.div>
    );
};
