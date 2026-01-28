import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import api from '../../../utils/api';
import usePolling from '../../../utils/usePolling';

const RecentActivityFeed = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/messages');
      const arr = Array.isArray(res?.data?.items) ? res.data.items : [];
      const mapped = arr.map((m, i) => ({
        id: String(m._id || i),
        type: 'message',
        title: m.title || m.subject || 'New Message',
        description: m.text || m.content || m.body || '',
        timestamp: m.createdAt || new Date().toISOString(),
        icon: 'MessageSquare',
        iconColor: 'text-blue-600',
        actionText: 'Read Message',
        messageId: m._id || m.id,
      }));
      setActivities(mapped);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  usePolling(load, 5000, []);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleActivityAction = (activity) => {
    navigate('/messages');
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/account-notifications')}
          iconName="Bell"
          iconPosition="left"
        >
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <div className={`p-2 rounded-full bg-muted ${activity?.iconColor}`}>
              <Icon name={activity?.icon} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-1">{activity?.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{activity?.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{getTimeAgo(activity?.timestamp)}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleActivityAction(activity)} className="text-xs h-auto p-1">
                      {activity?.actionText}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!loading && activities?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Activity" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;
