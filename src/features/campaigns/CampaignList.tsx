import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignService, type CampaignStats, type Campaign } from '../../services/campaignService';
import { Mail, MessageSquare, Calendar, TrendingUp, Plus, Search, Filter } from 'lucide-react';




export default function CampaignList() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState<CampaignStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterChannel, setFilterChannel] = useState<string>('all');

    useEffect(() => {
        loadData();
    }, [filterStatus, filterChannel]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [campaignsData, statsData] = await Promise.all([
                campaignService.list({
                    status: filterStatus !== 'all' ? filterStatus : undefined,
                    channel: filterChannel !== 'all' ? filterChannel : undefined
                }),
                campaignService.getStats()
            ]);
            setCampaigns(campaignsData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCampaigns = campaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusConfig = {
        draft: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
        scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
        sending: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
        completed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
        failed: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 font-medium">Loading campaigns...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 animate-fadeIn">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Campaign Management
                                </h1>
                                <p className="text-gray-600 mt-1">Create and manage email/SMS marketing campaigns</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard/admin/campaigns/templates">
                                <button className="px-4 py-2 bg-white border-2 border-purple-300 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-all">
                                    📝 Templates
                                </button>
                            </Link>
                            <Link to="/dashboard/admin/campaigns/new">
                                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    New Campaign
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                        <StatsCard title="Total" value={stats.total} gradient="from-blue-500 to-blue-600" />
                        <StatsCard title="Draft" value={stats.draft} gradient="from-gray-500 to-gray-600" />
                        <StatsCard title="Scheduled" value={stats.scheduled} gradient="from-blue-500 to-indigo-600" />
                        <StatsCard title="Sending" value={stats.sending} gradient="from-yellow-500 to-orange-600" />
                        <StatsCard title="Completed" value={stats.completed} gradient="from-green-500 to-green-600" />
                        <StatsCard title="Cancelled" value={stats.cancelled} gradient="from-red-500 to-red-600" />
                    </div>
                )}

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search campaigns..."
                                    className="w-full px-4 py-3 pl-11 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                            >
                                <option value="all">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="sending">Sending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Channel Filter */}
                        <div>
                            <select
                                value={filterChannel}
                                onChange={(e) => setFilterChannel(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                            >
                                <option value="all">All Channels</option>
                                <option value="email">Email Only</option>
                                <option value="sms">SMS Only</option>
                                <option value="both">Both</option>
                            </select>
                        </div>

                        {/* Campaign Type Filter - NEW */}
                        <div>
                            <select
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
                                onChange={(e) => {
                                    const type = e.target.value;
                                    if (type === 'all') {
                                        setCampaigns(campaigns);
                                    } else {
                                        setSearchQuery(''); // Clear search to avoid conflicts
                                    }
                                }}
                            >
                                <option value="all">All Types</option>
                                <option value="general">General</option>
                                <option value="appointment_reminder">Appointment Reminder</option>
                                <option value="health_tip">Health Tips</option>
                                <option value="promotional">Promotional</option>
                                <option value="follow_up">Follow-up</option>
                                <option value="birthday">Birthday</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Campaigns Table */}
                {filteredCampaigns.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-dashed border-purple-300 p-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-10 h-10 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No campaigns found</h3>
                        <p className="text-gray-500 mb-6">Create your first campaign to get started</p>
                        <Link to="/dashboard/admin/campaigns/new">
                            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                                <Plus className="w-5 h-5 inline mr-2" />
                                Create Campaign
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Campaign Name
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                            Channel
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Status
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                            </svg>
                                            Recipients
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            Delivered
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Schedule
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredCampaigns.map((campaign) => {
                                    const config = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.draft;
                                    return (
                                        <tr key={campaign.id} className="hover:bg-purple-50/50 transition-all duration-200 group cursor-pointer"
                                            onClick={() => window.location.href = `/dashboard/admin/campaigns/${campaign.id}`}>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md ring-2 ring-purple-100 group-hover:ring-purple-200 transition-all ${campaign.channel === 'email' ? 'bg-gradient-to-br from-blue-400 to-blue-500' :
                                                        campaign.channel === 'sms' ? 'bg-gradient-to-br from-green-400 to-green-500' :
                                                            'bg-gradient-to-br from-purple-400 to-purple-500'
                                                        }`}>
                                                        {campaign.channel === 'email' ? (
                                                            <Mail className="w-6 h-6 text-white" />
                                                        ) : campaign.channel === 'sms' ? (
                                                            <MessageSquare className="w-6 h-6 text-white" />
                                                        ) : (
                                                            <TrendingUp className="w-6 h-6 text-white" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                                            {campaign.name}
                                                        </div>
                                                        {campaign.description && (
                                                            <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                                                                {campaign.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${campaign.channel === 'email' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                    campaign.channel === 'sms' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                        'bg-purple-100 text-purple-800 border border-purple-200'
                                                    }`}>
                                                    {campaign.channel.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border-2 ${config.bg} ${config.text} ${config.border}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                                                    {campaign.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold text-gray-900">{campaign.total_recipients || 0}</span>
                                                    <span className="text-sm text-gray-500">people</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold text-green-600">{campaign.delivered_count || 0}</span>
                                                    {campaign.total_recipients && campaign.total_recipients > 0 && (
                                                        <span className="text-xs text-gray-500">
                                                            ({Math.round((campaign.delivered_count || 0) / campaign.total_recipients * 100)}%)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {campaign.scheduled_at && campaign.status === 'scheduled' ? (
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <Calendar className="w-4 h-4 text-purple-500" />
                                                        <span>{new Date(campaign.scheduled_at).toLocaleDateString()}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Not scheduled</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// Stats Card Component
const StatsCard = ({ title, value, gradient }: { title: string; value: number; gradient: string }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all">
        <p className="text-xs text-gray-600 mb-1 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <div className={`mt-2 h-1 bg-gradient-to-r ${gradient} rounded-full`}></div>
    </div>
);
