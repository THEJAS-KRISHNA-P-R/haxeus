"use client"

import { useState, useEffect } from "react"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Eye, Save, View, RotateCcw, AlertTriangle, PanelLeftClose } from "lucide-react"
import { useHomepageConfig } from "@/hooks/useHomepageConfig"
import { deepMerge } from "@/lib/deep-merge"
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage-defaults"
import type { HomepageConfig, SectionKey, ExitPopupConfig } from "@/types/homepage"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
    HeroEditor,
    FeaturedProductsEditor,
    NewsletterEditor,
    PreorderSectionEditor,
    AboutEditor,
    AnnouncementBarEditor
} from "@/components/admin/homepage/Editors"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useTheme } from "@/components/ThemeProvider"

type EditorPageSection = SectionKey;


function SortableSectionItem({ id, activeId, onSelect, isVisible, onToggleVisibility }: { id: SectionKey, activeId: EditorPageSection, onSelect: (id: EditorPageSection) => void, isVisible: boolean, onToggleVisibility: (id: SectionKey) => void }) {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    const isDark = !mounted ? true : theme === "dark"
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }
    const isActive = id === activeId
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`flex items-center p-3 rounded-lg cursor-pointer ${isActive ? 'bg-[#e93a3a]/10' : isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'} ${!isVisible && 'opacity-50'}`}
            onClick={() => onSelect(id)}
        >
            <button {...listeners} className={`cursor-grab mr-3 ${isDark ? 'text-white/50' : 'text-black/55'}`}><GripVertical size={18} /></button>
            <span className={`flex-grow capitalize ${isDark ? 'text-white' : 'text-black'}`}>{id.replace(/_/g, ' ')}</span>
            {id !== 'testimonials' && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(id); }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${isVisible
                        ? isDark
                            ? 'border-[#07e4e1]/30 bg-[#07e4e1]/10 text-[#07e4e1] hover:bg-[#07e4e1]/15'
                            : 'border-[#059e9b]/30 bg-[#059e9b]/10 text-[#059e9b] hover:bg-[#059e9b]/15'
                        : isDark
                            ? 'border-white/[0.12] text-white/60 hover:text-white hover:bg-white/[0.05]'
                            : 'border-black/[0.12] text-black/55 hover:text-black hover:bg-black/[0.05]'
                    }`}
                    aria-label={isVisible ? `Hide ${id.replace(/_/g, ' ')}` : `Show ${id.replace(/_/g, ' ')}`}
                >
                    <Eye size={18} />
                </button>
            )}
        </div>
    )
}

export default function HomepageEditorPage() {
    const { theme } = useTheme()
    const { config: liveConfig, loading, updateConfig } = useHomepageConfig()
    const [mounted, setMounted] = useState(false)
    const [editConfig, setEditConfig] = useState<HomepageConfig>(DEFAULT_HOMEPAGE_CONFIG)
    const [saving, setSaving] = useState(false)
    const [selectedSection, setSelectedSection] = useState<EditorPageSection>("hero")
    const [isDirty, setIsDirty] = useState(false)
    const [leftPanelOpen, setLeftPanelOpen] = useState(true)
    const [resetDialogOpen, setResetDialogOpen] = useState(false)
    const [resetting, setResetting] = useState(false)
    const isDark = !mounted ? true : theme === "dark"

    useEffect(() => setMounted(true), [])

    useEffect(() => {
        if (!loading && liveConfig) {
            // Use deepMerge to ensure new properties from default config are included
            setEditConfig(deepMerge(DEFAULT_HOMEPAGE_CONFIG, liveConfig));
        }
    }, [loading, liveConfig])

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }))

    const isSectionVisible = (sectionId: SectionKey) => {
        if (sectionId === 'testimonials') {
            return !editConfig.hidden_sections.includes(sectionId)
        }

        const sectionConfig = editConfig[sectionId as keyof HomepageConfig]
        const visibleFlag = typeof sectionConfig === 'object' && sectionConfig !== null && 'visible' in sectionConfig
            ? Boolean((sectionConfig as { visible?: boolean }).visible)
            : true

        return visibleFlag && !editConfig.hidden_sections.includes(sectionId)
    }

    function handleDragEnd(event: any) {
        const { active, over } = event
        if (active.id !== over.id) {
            setEditConfig((config) => {
                const oldIndex = config.section_order.indexOf(active.id)
                const newIndex = config.section_order.indexOf(over.id)
                const newOrder = arrayMove(config.section_order, oldIndex, newIndex);
                return { ...config, section_order: newOrder };
            })
            setIsDirty(true)
        }
    }

    function updateSection<K extends keyof HomepageConfig>(
        section: K,
        updates: Partial<HomepageConfig[K]>
    ) {
        setEditConfig(prev => {
            const newSectionConfig = { ...(prev[section] as object), ...updates };
            return { ...prev, [section]: newSectionConfig };
        })
        setIsDirty(true)
    }

    const handleSave = async () => {
        setSaving(true);
        const { success, error } = await updateConfig(editConfig);
        if (success) {
            toast.success("Homepage updated successfully!");
            setIsDirty(false);
        } else {
            toast.error(error || "Failed to update homepage.");
        }
        setSaving(false);
    };

    const handleRevert = () => {
        if (liveConfig) {
            setEditConfig(deepMerge(DEFAULT_HOMEPAGE_CONFIG, liveConfig));
            setIsDirty(false);
            toast.info("Draft reverted to last saved version.", {
                style: { color: 'rgba(255, 255, 255, 0.6)' }
            });
        }
    };

    const handleFullReset = async () => {
        setResetting(true);
        try {
            const res = await fetch("/api/admin/config/homepage/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Reset failed");
            }
            const { config: newConfig } = await res.json();
            setEditConfig(newConfig);
            // liveConfig will auto-update via Realtime, but we can force the local state
            setIsDirty(false);
            setResetDialogOpen(false);
            toast.success("Homepage reset to default layout.");
        } catch (error: any) {
            toast.error(`Reset failed: ${error.message}`);
        } finally {
            setResetting(false);
        }
    };

    const toggleSectionVisibility = (sectionId: SectionKey) => {
        if (sectionId === 'testimonials') return; // Cannot be hidden
        
        setEditConfig(prev => {
            const willBeVisible = prev.hidden_sections.includes(sectionId)
            const newHidden = willBeVisible
                ? prev.hidden_sections.filter(id => id !== sectionId)
                : [...prev.hidden_sections, sectionId]
            const nextConfig: HomepageConfig = { ...prev, hidden_sections: newHidden }

            if (sectionId === 'hero') nextConfig.hero = { ...prev.hero, visible: willBeVisible }
            if (sectionId === 'newsletter') nextConfig.newsletter = { ...prev.newsletter, visible: willBeVisible }
            if (sectionId === 'featured_products') nextConfig.featured_products = { ...prev.featured_products, visible: willBeVisible }
            if (sectionId === 'preorder') nextConfig.preorder = { ...prev.preorder, visible: willBeVisible }
            if (sectionId === 'about') nextConfig.about = { ...prev.about, visible: willBeVisible }
            if (sectionId === 'announcement_bar') nextConfig.announcement_bar = { ...prev.announcement_bar, visible: willBeVisible }

            return nextConfig
        });
        setIsDirty(true);
    };

    const renderEditor = () => {
        switch (selectedSection) {
            case 'hero': return <HeroEditor config={editConfig.hero} update={(u) => updateSection('hero', u)} />
            case 'featured_products': return <FeaturedProductsEditor config={editConfig.featured_products} update={(u) => updateSection('featured_products', u)} />
            case 'newsletter': return <NewsletterEditor config={editConfig.newsletter} update={(u) => updateSection('newsletter', u)} />
            case 'preorder': return <PreorderSectionEditor config={editConfig.preorder} update={(u) => updateSection('preorder', u)} />
            case 'about': return <AboutEditor config={editConfig.about} update={(u) => updateSection('about', u)} />
            case 'announcement_bar': return <AnnouncementBarEditor config={editConfig.announcement_bar} update={(u) => updateSection('announcement_bar', u)} />
            // 'testimonials' has no editor
            default: return <div className={`p-6 rounded-lg ${isDark ? 'bg-white/[0.05] text-white/50' : 'bg-black/[0.04] text-black/55'}`}>This section does not have any editable properties.</div>;
        }
    }

    const sectionOrderWithAnnouncements = ['announcement_bar', ...editConfig.section_order];

    return (
        <div>
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Homepage Editor</h1>
                <div className="flex gap-2 sm:gap-4 items-center flex-wrap">
                    <Link href="/" target="_blank" passHref>
                        <Button variant="outline" className="h-10 px-5 text-sm font-semibold"><View className="mr-2 h-4 w-4" /> View Live Site</Button>
                    </Link>
                    <Button
                        variant="ghost"
                        onClick={() => setResetDialogOpen(true)}
                        className="border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 rounded-full px-5 h-10 text-sm font-semibold"
                    >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Reset to Default
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleRevert}
                        disabled={!isDirty}
                        className={`border rounded-full px-5 h-10 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'border-white/[0.12] text-white/70 hover:text-white' : 'border-black/[0.12] text-black/70 hover:text-black'}`}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Revert Changes
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!isDirty || saving}
                        className="bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full px-5 h-10 text-sm"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save & Publish"}
                    </Button>
                </div>
            </div>

            <div className="flex items-start gap-4 lg:gap-8">
                <motion.div
                    animate={{ width: leftPanelOpen ? 280 : 0, opacity: leftPanelOpen ? 1 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden flex-shrink-0"
                >
                    <div className={`rounded-2xl border p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-black/[0.01] border-black/[0.07]'}`}>
                        <h3 className={`text-sm font-medium px-2 pb-1 ${isDark ? 'text-white' : 'text-black'}`}>Page Sections</h3>
                        <p className={`text-xs px-2 pb-3 ${isDark ? 'text-white/40' : 'text-black/40'}`}>Drag to reorder sections. Use the eye icon to quickly hide or show them.</p>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={editConfig.section_order} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2">
                                    {sectionOrderWithAnnouncements.map(id => (
                                        <SortableSectionItem
                                            key={id}
                                            id={id as SectionKey}
                                            activeId={selectedSection}
                                            onSelect={setSelectedSection}
                                            isVisible={isSectionVisible(id as SectionKey)}
                                            onToggleVisibility={toggleSectionVisibility}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
                            <div
                                className={`flex items-center p-3 rounded-lg cursor-pointer ${selectedSection === 'exit_popup' ? 'bg-[#e93a3a]/10' : isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                                onClick={() => setSelectedSection('exit_popup')}
                            >
                                <div className="flex-grow">
                                    <p className={`text-sm font-medium capitalize ${isDark ? 'text-white' : 'text-black'}`}>Exit Popup</p>
                                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-black/40'}`}>Configure the existing exit-intent popup content.</p>
                                </div>
                                <span className="text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full px-2 py-0.5">POPUP</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <button
                    onClick={() => setLeftPanelOpen((prev) => !prev)}
                    className={`self-start mt-4 p-2 rounded-xl transition-colors flex-shrink-0 ${
                        isDark
                            ? "bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white"
                            : "bg-black/[0.04] hover:bg-black/[0.08] text-black/50 hover:text-black"
                    }`}
                    title={leftPanelOpen ? "Collapse sections" : "Expand sections"}
                >
                    <motion.div animate={{ rotate: leftPanelOpen ? 0 : 180 }} transition={{ duration: 0.2 }}>
                        <PanelLeftClose size={18} />
                    </motion.div>
                </button>

                <div className={`flex-1 rounded-2xl border p-6 ${isDark ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-black/[0.01] border-black/[0.07]'}`}>
                    {renderEditor()}
                </div>
            </div>

            {resetDialogOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className={`rounded-2xl p-8 max-w-sm w-full mx-4 border ${isDark ? 'bg-[#111] border-white/[0.07]' : 'bg-[#f5f4f0] border-black/[0.07]'}`}>
                        <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Reset to Base Layout?</h2>
                        <p className={`mb-6 ${isDark ? 'text-white/70' : 'text-black/65'}`}>
                            This will permanently overwrite your current homepage configuration with the
                            original default layout. This cannot be undone. The homepage will update
                            instantly for all visitors.
                        </p>
                        <div className="flex justify-end gap-4">
                            <Button
                                variant="ghost"
                                onClick={() => setResetDialogOpen(false)}
                                className={`border rounded-full px-6 h-10 ${isDark ? 'border-white/[0.12] text-white/70 hover:text-white' : 'border-black/[0.12] text-black/70 hover:text-black'}`}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleFullReset}
                                disabled={resetting}
                                className="bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full px-6 h-10"
                            >
                                {resetting ? "Resetting..." : "Yes, Reset Everything"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
