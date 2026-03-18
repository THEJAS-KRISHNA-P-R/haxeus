"use client"

import { useState, useEffect } from "react"
import { Eye, Save, View } from "lucide-react"
import { useHomepageConfig } from "@/hooks/useHomepageConfig"
import { deepMerge } from "@/lib/deep-merge"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"
import type { HomepageConfig } from "@/types/homepage"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    HeroEditor,
} from "@/components/admin/homepage/Editors"
import Link from "next/link"
import { useTheme } from "@/components/ThemeProvider"

export default function HomepageEditorPage() {
    const { theme } = useTheme()
    const { config: liveConfig, loading, updateConfig } = useHomepageConfig()
    const [mounted, setMounted] = useState(false)
    const [editConfig, setEditConfig] = useState<HomepageConfig>(DEFAULT_HOMEPAGE_CONFIG)
    const [saving, setSaving] = useState(false)
    const isDark = !mounted ? true : theme === "dark"

    useEffect(() => setMounted(true), [])

    useEffect(() => {
        if (!loading && liveConfig) {
            setEditConfig(deepMerge(DEFAULT_HOMEPAGE_CONFIG, liveConfig));
        }
    }, [loading, liveConfig])

    function updateSection<K extends keyof HomepageConfig>(
        section: K,
        updates: Partial<HomepageConfig[K]>
    ) {
        setEditConfig(prev => {
            const newSectionConfig = { ...(prev[section] as object), ...updates };
            return { ...prev, [section]: newSectionConfig };
        })
    }

    const handleSave = async () => {
        setSaving(true);
        const { success, error } = await updateConfig(editConfig);
        if (success) {
            toast.success("Homepage updated successfully!");
        } else {
            toast.error(error || "Failed to update homepage.");
        }
        setSaving(false);
    };

    if (loading && !mounted) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Homepage Editor</h1>
                <div className="flex gap-2 sm:gap-4 items-center flex-wrap">
                    <Link href="/" target="_blank" passHref>
                        <Button variant="outline" className="h-10 px-5 text-sm font-semibold"><View className="mr-2 h-4 w-4" /> View Live Site</Button>
                    </Link>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full px-5 h-10 text-sm"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save & Publish"}
                    </Button>
                </div>
            </div>

            <div className="flex items-start gap-4 lg:gap-8">
                <div className={`flex-1 rounded-2xl border p-6 ${isDark ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-black/[0.01] border-black/[0.07]'}`}>
                    <HeroEditor config={editConfig.hero} update={(u) => updateSection('hero', u)} />
                </div>
            </div>
        </div>
    )
}
