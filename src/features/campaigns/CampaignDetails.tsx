import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { campaignService, type Campaign, type CampaignRecipient } from '../../services/campaignService';
import { useAuthStore } from '../../store/authStore';
import {
    ArrowLeft, Mail, MessageSquare, TrendingUp, Users,
    CheckCircle2, XCircle, Clock, Edit, Copy, Trash2,
    Download, Play, Pause, Calendar, Eye
} from 'lucide-react';

import { useToast } from '../../hooks/useToast';




export default function CampaignDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuthStore();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [recipients, setRecipients] = useState<CampaignRecipient[]>([]);
    const [loading, setLoading] = useState(true);
    const [recipientFilter, setRecipientFilter] = useState<string>('all');

    useEffect(() => {
        if (id) {
            loadCampaignDetails();
        }
    }, [id]);

    const loadCampaignDetails = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const [campaignData, recipientsData] = await Promise.all([
                campaignService.getById(id),
                campaignService.getRecipients(id)
            ]);

            setCampaign(campaignData);
            setRecipients(recipientsData);
        } catch (error) {
            console.error('Failed to load campaign:', error);
            toast.error('Failed to load campaign details');
        } finally {
            setLoading(false);
        }
    };

    const handleDuplicate = async () => {
        if (!campaign || !user) return;

        try {
            const newCampaign = await campaignService.create({
                name: `${campaign.name} (Copy)`,
                description: campaign.description,
                channel: campaign.channel,
                campaign_type: campaign.campaign_type,
                subject: campaign.subject,
                message: campaign.message,
                target_type: campaign.target_type,
                filters: campaign.filters,
                send_type: 'immediate',
                created_by: user.id
            });

            toast.success('Campaign duplicated successfully!');
            navigate(`/dashboard/admin/campaigns/${newCampaign.id}`);
        } catch (error) {
            console.error('Failed to duplicate campaign:', error);
            toast.error('Failed to duplicate campaign');
        }
    };

    const handleDelete = async () => {
        if (!campaign || !id) return;

        if (confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
            try {
                await campaignService.delete(id);
                toast.success('Campaign deleted successfully');
                navigate('/dashboard/admin/campaigns');
            } catch (error) {
                console.error('Failed to delete campaign:', error);
                toast.error('Failed to delete campaign');
            }
        }
    };

    const handleCancel = async () => {
        if (!campaign || !id) return;

        if (confirm(`Cancel campaign "${campaign.name}"?`)) {
            try {
                await campaignService.update(id, { status: 'cancelled' });
                toast.success('Campaign cancelled');
                loadCampaignDetails();
            } catch (error) {
                console.error('Failed to cancel campaign:', error);
                toast.error('Failed to cancel campaign');
            }
        }
    };

    const filteredRecipients = recipients.filter(r =>
        recipientFilter === 'all' || r.status === recipientFilter
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 font-medium">Loading campaign...</p>
                </div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign not found</h2>
                    <Link to="/dashboard/admin/campaigns" className="text-purple-600 hover:text-purple-700">
                        ← Back to Campaigns
                    </Link>
                </div>
            </div>
        );
    }

    const channelIcon = campaign.channel === 'email' ? Mail : campaign.channel === 'sms' ? MessageSquare : TrendingUp;
    const ChannelIcon = channelIcon;

    const deliveryRate = campaign.total_recipients > 0
        ? ((campaign.delivered_count / campaign.total_recipients) * 100).toFixed(1)
        : '0';

    const openRate = campaign.delivered_count > 0
        ? ((campaign.opened_count / campaign.delivered_count) * 100).toFixed(1)
        : '0';

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/dashboard/admin/campaigns"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Campaigns
                    </Link>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${campaign.channel === 'email' ? 'bg-blue-100' :
                                    campaign.channel === 'sms' ? 'bg-green-100' : 'bg-purple-100'
                                    }`}>
                                    <ChannelIcon className={`w-8 h-8 ${campaign.channel === 'email' ? 'text-blue-600' :
                                        campaign.channel === 'sms' ? 'text-green-600' : 'text-purple-600'
                                        }`} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
                                    <p className="text-gray-600">{campaign.description || 'No description'}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${campaign.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            campaign.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                                                campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                                                    campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                                                        'bg-red-100 text-red-700'
                                            }`}>
                                            {campaign.status.toUpperCase()}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Created {new Date(campaign.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                {campaign.status === 'draft' && (
                                    <button
                                        onClick={() => navigate(`/dashboard/admin/campaigns/${id}/edit`)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                )}
                                <button
                                    onClick={handleDuplicate}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center gap-2"
                                >
                                    <Copy className="w-4 h-4" />
                                    Duplicate
                                </button>
                                {(campaign.status === 'sending' || campaign.status === 'scheduled') && (
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition-all flex items-center gap-2"
                                    >
                                        <Pause className="w-4 h-4" />
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Recipients"
                        value={campaign.total_recipients}
                        icon={<Users className="w-6 h-6" />}
                        gradient="from-blue-500 to-blue-600"
                    />
                    <StatCard
                        title="Delivered"
                        value={campaign.delivered_count}
                        subtitle={`${deliveryRate}%`}
                        icon={<CheckCircle2 className="w-6 h-6" />}
                        gradient="from-green-500 to-green-600"
                    />
                    <StatCard
                        title="Opened"
                        value={campaign.opened_count}
                        subtitle={`${openRate}%`}
                        icon={<Eye className="w-6 h-6" />}
                        gradient="from-purple-500 to-purple-600"
                    />
                    <StatCard
                        title="Failed"
                        value={campaign.failed_count}
                        icon={<XCircle className="w-6 h-6" />}
                        gradient="from-red-500 to-red-600"
                    />
                </div>

                {/* Recipients List */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Recipients</h2>
                        <div className="flex gap-3">
                            <select
                                value={recipientFilter}
                                onChange={(e) => setRecipientFilter(e.target.value)}
                                className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                            >
                                <option value="all">All ({recipients.length})</option>
                                <option value="sent">Sent</option>
                                <option value="delivered">Delivered</option>
                                <option value="opened">Opened</option>
                                <option value="failed">Failed</option>
                            </select>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {filteredRecipients.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">No recipients found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-y border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Patient</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Contact</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Sent At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredRecipients.slice(0, 50).map((recipient: any) => (
                                        <tr key={recipient.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {recipient.patients?.profiles?.first_name} {recipient.patients?.profiles?.last_name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {recipient.recipient_address}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${recipient.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    recipient.status === 'opened' ? 'bg-blue-100 text-blue-700' :
                                                        recipient.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {recipient.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {recipient.sent_at ? new Date(recipient.sent_at).toLocaleString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredRecipients.length > 50 && (
                                <p className="text-center py-4 text-sm text-gray-600">
                                    Showing 50 of {filteredRecipients.length} recipients
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    gradient
}: {
    title: string;
    value: number;
    subtitle?: string;
    icon: React.ReactNode;
    gradient: string;
}) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white mb-3`}>
            {icon}
        </div>
        <p className="text-xs text-gray-600 font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
    </div>
);
