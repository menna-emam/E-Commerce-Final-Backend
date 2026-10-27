const Notification = require('../model/notification.model');
exports.getNotifications = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const filter = {};
  if (req.query.unread === 'true') filter.isRead = false;
  const [total, unreadCount, notifications] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.countDocuments({ isRead: false }),
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);
  res.status(200).json({
    message: 'notifications',page,limit,total,totalPages: Math.ceil(total / limit),
    unreadCount,data: notifications,
  });
};
exports.markAsRead = async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    {isRead:true},
    {new:true}
  );

  if (!notification) {
    return res.status(404).json({ error: 'notification not found' });
  }
  res.status(200).json({ message: 'notification marked as read', data: notification });
};
exports.markAllAsRead = async (req, res) => {
  const result = await Notification.updateMany({ isRead: false }, { isRead: true });
  res.status(200).json({
    message: 'all notifications marked as read',
    updated: result.modifiedCount,
  });
};