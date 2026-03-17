"use client"

import { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Edit, Trash2, Layers, AlertTriangle, CheckCircle, XCircle, Clock, MousePointer, BarChart2, Calendar, Users, UserCheck, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { PopupCampaign, AudienceType, TriggerType, PopupLayout, ContentBlock, ContentBlockType } from '@/types/popup';
import { DEFAULT_POPUP_CAMPAIGNS } from '@/lib/popup-defaults';
import { v4 as uuidv4 } from 'uuid';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from 'next/image';
import { useTheme } from 'next-themes';

// Mock API calls for now
const fetchCampaigns = async () => {
    const res = await fetch('/api/admin/popups');
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
};

const seedCampaigns = async () => {
    const res = await fetch('/api/admin/popups/seed', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to seed campaigns');
    return res.json();
}

const reorderCampaigns = async (ordered_ids: string[]) => {
    await fetch('/api/admin/popups/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ordered_ids }),
    });
};

const updateCampaign = async (id: string, data: Partial<PopupCampaign>) => {
    await fetch(`/api/admin/popups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};

const createCampaign = async (data: Partial<PopupCampaign>) => {
    const res = await fetch(`/api/admin/popups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
};

const deleteCampaign = async (id: string) => {
    await fetch(`/api/admin/popups/${id}`, { method: 'DELETE' });
};


const AUDIENCE_META: Record<AudienceType, { label: string; color: string; icon: React.ElementType }> = {
    everyone: { label: 'Everyone', color: 'bg-gray-400', icon: Users },
    new_visitor: { label: 'New Visitor', color: 'bg-yellow-400', icon: UserPlus },
    returning_visitor: { label: 'Returning Visitor', color: 'bg-teal-400', icon: UserCheck },
    logged_in: { label: 'Logged In', color: 'bg-blue-500', icon: Users },
    first_time_buyer: { label: 'First-Time Buyer', color: 'bg-green-500', icon: UserPlus },
    returning_customer: { label: 'Returning Customer', color: 'bg-pink-500', icon: UserCheck },
};

const TRIGGER_META: Record<TriggerType, { label: string; icon: React.ElementType }> = {
    exit_intent: { label: 'Exit Intent', icon: MousePointer },
    on_load: { label: 'On Load', icon: Clock },
    scroll_stop: { label: 'Scroll Stop', icon: BarChart2 },
    scroll_depth: { label: 'Scroll Depth', icon: BarChart2 },
    time_on_page: { label: 'Time on Page', icon: Calendar },
};

function SortableCampaignItem({ campaign, onUpdate, onDelete, isDark }: { campaign: PopupCampaign, onUpdate: (id: string, data: Partial<PopupCampaign>) => void, onDelete: (id: string) => void, isDark: boolean }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: campaign.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    const audienceMeta = AUDIENCE_META[campaign.audience];
    const triggerMeta = TRIGGER_META[campaign.trigger.type];

    return (
        <div ref={setNodeRef} style={style} className={`rounded-lg p-4 flex items-center gap-4 border ${isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-black/[0.02] border-black/[0.07]'}`}>
            <div {...attributes} {...listeners} className="cursor-grab touch-none p-2">
                <GripVertical size={20} className={isDark ? "text-white/50" : "text-black/55"} />
            </div>
            <Badge variant="secondary" className="h-6 w-6 flex items-center justify-center text-xs font-bold">#{campaign.sort_order + 1}</Badge>
            <div className="flex-grow">
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>{campaign.name}</p>
                <div className={`flex items-center gap-4 text-xs mt-1 ${isDark ? 'text-white/60' : 'text-black/55'}`}>
                    <div className="flex items-center gap-1.5">
                        <audienceMeta.icon size={14} className={isDark ? "text-white/50" : "text-black/55"} />
                        <span className={`w-2 h-2 rounded-full ${audienceMeta.color}`}></span>
                        {audienceMeta.label}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <triggerMeta.icon size={14} className={isDark ? "text-white/50" : "text-black/55"} />
                        {triggerMeta.label}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Layers size={14} className={isDark ? "text-white/50" : "text-black/55"} />
                        {campaign.layout}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Toggle checked={campaign.enabled} onChange={(checked) => onUpdate(campaign.id, { enabled: checked })} size="sm" />
                <Button variant="ghost" size="icon" onClick={() => onUpdate(campaign.id, campaign)}><Edit size={16} /></Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400" onClick={() => onDelete(campaign.id)}><Trash2 size={16} /></Button>
            </div>
        </div>
    );
}


export default function PopupAdminPage() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [campaigns, setCampaigns] = useState<PopupCampaign[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, captures_today: 0, captures_total: 0 });
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Partial<PopupCampaign> | null>(null);
    const isDark = !mounted ? true : (
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    useEffect(() => setMounted(true), []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchCampaigns();
            if (data.campaigns.length === 0) {
                await seedCampaigns();
                const seededData = await fetchCampaigns();
                setCampaigns(seededData.campaigns);
                setStats(seededData.stats);
            } else {
                setCampaigns(data.campaigns);
                setStats(data.stats);
            }
        } catch (error) {
            toast.error('Failed to load popup campaigns.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setCampaigns((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over!.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                const orderedIds = newOrder.map(c => c.id);
                toast.promise(reorderCampaigns(orderedIds), {
                    loading: 'Saving new order...',
                    success: 'Order saved!',
                    error: 'Failed to save order.',
                });
                return newOrder.map((c, i) => ({ ...c, sort_order: i }));
            });
        }
    };

    const handleUpdate = async (id: string, data: Partial<PopupCampaign>) => {
        setCampaigns(campaigns.map(c => c.id === id ? { ...c, ...data } : c));
        toast.promise(updateCampaign(id, data), {
            loading: 'Saving changes...',
            success: 'Changes saved!',
            error: 'Failed to save changes.',
        });
    };
    
    const handleOpenEditor = (campaign: Partial<PopupCampaign> | null) => {
        if (campaign) {
            setEditingCampaign(campaign);
        } else {
            // Create new
            setEditingCampaign({
                name: 'New Campaign',
                enabled: false,
                audience: 'everyone',
                trigger: { type: 'on_load' },
                cooldown_hours: 24,
                max_shows_per_session: 1,
                show_once_ever: false,
                layout: 'centered',
                image_url: '',
                image_alt: '',
                blocks: [],
                overlay_opacity: 0.7,
                accent_color: '#e93a3a',
                border_radius: 16,
                max_width: 480,
                dark_panel: true,
                capture_email: false,
                coupon_code: '',
                coupon_auto_copy: false,
                security: {
                    max_email_submissions_per_ip_per_hour: 3,
                    require_valid_mx: false,
                    block_disposable_emails: true,
                    honeypot_field: true,
                    rate_limit_coupon_reveal: true,
                }
            });
        }
        setIsEditorOpen(true);
    };

    const handleSaveFromEditor = async () => {
        if (!editingCampaign) return;
        
        const promise = editingCampaign.id 
            ? updateCampaign(editingCampaign.id, editingCampaign)
            : createCampaign(editingCampaign);

        toast.promise(promise, {
            loading: 'Saving campaign...',
            success: () => {
                loadData(); // Reload all data
                return 'Campaign saved!';
            },
            error: 'Failed to save campaign.',
        });
        setIsEditorOpen(false);
        setEditingCampaign(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this campaign? This cannot be undone.')) {
            toast.promise(deleteCampaign(id), {
                loading: 'Deleting campaign...',
                success: () => {
                    loadData();
                    return 'Campaign deleted!';
                },
                error: 'Failed to delete campaign.',
            });
        }
    };

    if (loading) {
        return <div className={`p-8 ${isDark ? 'text-white' : 'text-black'}`}>Loading campaigns...</div>;
    }

    return (
        <div className={`p-8 min-h-screen ${isDark ? 'text-white bg-[#0a0a0a]' : 'text-black bg-[#f5f4f0]'}`}>
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Popup Campaigns</h1>
                <Button onClick={() => handleOpenEditor(null)}><Plus className="mr-2" size={16} /> Add New Campaign</Button>
            </header>

            <div className="grid grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Campaigns" value={stats.total} icon={Layers} isDark={isDark} />
                <StatCard title="Active Campaigns" value={stats.active} icon={CheckCircle} isDark={isDark} />
                <StatCard title="Captures Today" value={stats.captures_today} icon={Calendar} isDark={isDark} />
                <StatCard title="Total Captures" value={stats.captures_total} icon={Users} isDark={isDark} />
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={campaigns} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {campaigns.map((campaign) => (
                            <SortableCampaignItem key={campaign.id} campaign={campaign} onUpdate={(id, data) => {
                                if ('enabled' in data) {
                                    handleUpdate(id, data);
                                } else {
                                    handleOpenEditor(campaign);
                                }
                            }} onDelete={handleDelete} isDark={isDark} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {isEditorOpen && editingCampaign && (
                <CampaignEditor
                    campaign={editingCampaign}
                    setCampaign={setEditingCampaign}
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    onSave={handleSaveFromEditor}
                    isDark={isDark}
                />
            )}
        </div>
    );
}

const StatCard = ({ title, value, icon: Icon, isDark }: { title: string, value: number, icon: React.ElementType, isDark: boolean }) => (
    <div className={`rounded-lg p-4 flex items-center gap-4 border ${isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-black/[0.02] border-black/[0.07]'}`}>
        <div className={`p-3 rounded-lg ${isDark ? 'bg-white/[0.05]' : 'bg-black/[0.04]'}`}>
            <Icon size={24} className={isDark ? "text-white/80" : "text-black/65"} />
        </div>
        <div>
            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-black/55'}`}>{title}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{value}</p>
        </div>
    </div>
);

// A simplified editor modal. A real implementation would be more complex.
function CampaignEditor({ campaign, setCampaign, isOpen, onClose, onSave, isDark }: {
    campaign: Partial<PopupCampaign>,
    setCampaign: (c: Partial<PopupCampaign>) => void,
    isOpen: boolean,
    onClose: () => void,
    onSave: () => void,
    isDark: boolean
}) {
    // This is a stub. A full editor would be very large.
    // This provides a basic structure.
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`max-w-4xl h-[90vh] flex flex-col ${isDark ? 'bg-[#0a0a0a] border-white/[0.07] text-white' : 'bg-[#f5f4f0] border-black/[0.07] text-black'}`}>
                <DialogHeader>
                    <DialogTitle>{campaign.id ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto pr-2">
                    <Tabs defaultValue="basics" className="w-full">
                        <TabsList>
                            <TabsTrigger value="basics">Basics</TabsTrigger>
                            <TabsTrigger value="design">Design</TabsTrigger>
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="behavior">Behavior</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                        </TabsList>
                        <TabsContent value="basics" className="p-4">
                            <div className="space-y-4">
                                <div>
                                    <label className={`text-sm font-medium mb-1 block ${isDark ? 'text-white/80' : 'text-black/65'}`}>Campaign Name</label>
                                    <Input value={campaign.name} onChange={e => setCampaign({ ...campaign, name: e.target.value })} className={isDark ? "bg-white/[0.03] border-white/[0.12]" : "bg-black/[0.02] border-black/[0.12]"} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Toggle checked={campaign.enabled} onChange={c => setCampaign({ ...campaign, enabled: c })} size="sm" />
                                    <label>Enabled</label>
                                </div>
                                <div>
                                    <label>Audience</label>
                                    <Select value={campaign.audience} onValueChange={(v: AudienceType) => setCampaign({ ...campaign, audience: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(AUDIENCE_META).map(([key, meta]) => <SelectItem key={key} value={key}>{meta.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label>Trigger</label>
                                    <Select value={campaign.trigger?.type} onValueChange={(v: TriggerType) => setCampaign({ ...campaign, trigger: { ...campaign.trigger, type: v } })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(TRIGGER_META).map(([key, meta]) => <SelectItem key={key} value={key}>{meta.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Add more fields here */}
                            </div>
                        </TabsContent>
                        <TabsContent value="design" className="p-4">
                            {/* Design fields */}
                        </TabsContent>
                        <TabsContent value="content" className="p-4">
                            <ContentBlockEditor campaign={campaign} setCampaign={setCampaign} isDark={isDark} />
                        </TabsContent>
                        <TabsContent value="behavior" className="p-4">
                            {/* Behavior fields */}
                        </TabsContent>
                        <TabsContent value="security" className="p-4">
                            {/* Security fields */}
                        </TabsContent>
                    </Tabs>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onSave}>Save Campaign</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ContentBlockEditor({ campaign, setCampaign, isDark }: { campaign: Partial<PopupCampaign>, setCampaign: (c: Partial<PopupCampaign>) => void, isDark: boolean }) {
    const blocks = campaign.blocks || [];

    const handleBlockUpdate = (index: number, updatedBlock: Partial<ContentBlock>) => {
        const newBlocks = [...blocks];
        newBlocks[index] = { ...newBlocks[index], ...updatedBlock };
        setCampaign({ ...campaign, blocks: newBlocks });
    };

    const addBlock = () => {
        const newBlock: ContentBlock = {
            id: uuidv4(),
            type: 'subtext',
            text: 'New block',
        };
        setCampaign({ ...campaign, blocks: [...blocks, newBlock] });
    };

    const removeBlock = (index: number) => {
        setCampaign({ ...campaign, blocks: blocks.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-4">
            {blocks.map((block, index) => (
                <div key={block.id} className={`p-4 rounded-lg border ${isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-black/[0.02] border-black/[0.07]'}`}>
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold capitalize">{block.type.replace('_', ' ')}</h4>
                        <Button variant="ghost" size="icon" onClick={() => removeBlock(index)}><Trash2 size={16} /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <Select value={block.type} onValueChange={(v: ContentBlockType) => handleBlockUpdate(index, { type: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="headline">Headline</SelectItem>
                                <SelectItem value="subtext">Subtext</SelectItem>
                                <SelectItem value="cta_button">CTA Button</SelectItem>
                                <SelectItem value="email_capture">Email Capture</SelectItem>
                                <SelectItem value="badge">Badge</SelectItem>
                                <SelectItem value="coupon_chip">Coupon Chip</SelectItem>
                                <SelectItem value="dismiss_link">Dismiss Link</SelectItem>
                                <SelectItem value="fine_print">Fine Print</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea placeholder="Text content" value={block.text} onChange={e => handleBlockUpdate(index, { text: e.target.value })} />
                        {/* Add more fields for styling */}
                    </div>
                </div>
            ))}
            <Button onClick={addBlock} variant="outline" className="w-full">Add Block</Button>
        </div>
    );
}
