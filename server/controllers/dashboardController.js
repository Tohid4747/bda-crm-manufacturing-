const Lead = require('../models/Lead');
const Client = require('../models/Client');
const User = require('../models/User');
const { STATUSES } = Lead;

const buildMonthLabels = (monthsBack = 6) => {
  const labels = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
    });
  }

  return labels;
};

const getAdminDashboard = async (req, res) => {
  try {
    const [totalLeads, totalClients, totalBdaMembers] = await Promise.all([
      Lead.countDocuments(),
      Client.countDocuments(),
      User.countDocuments({ role: 'BDA', isActive: true }),
    ]);

    const statusAgg = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusMap = Object.fromEntries(
      statusAgg.map((s) => [s._id, s.count])
    );

    const leadStatusBreakdown = STATUSES.map((status) => ({
      status,
      count: statusMap[status] || 0,
    }));

    const monthLabels = buildMonthLabels(6);
    const startDate = new Date(
      monthLabels[0].year,
      monthLabels[0].month - 1,
      1
    );

    const monthlyAgg = await Lead.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyMap = Object.fromEntries(
      monthlyAgg.map((m) => [`${m._id.year}-${m._id.month}`, m.count])
    );

    const monthlyLeadsTrend = monthLabels.map(({ year, month, label }) => ({
      month: label,
      count: monthlyMap[`${year}-${month}`] || 0,
    }));

    const topBdasRaw = await Lead.aggregate([
      { $match: { status: 'Closed Won', assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', closedWon: { $sum: 1 } } },
      { $sort: { closedWon: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          id: '$_id',
          name: '$user.name',
          email: '$user.email',
          closedWon: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard data fetched',
      data: {
        stats: {
          totalLeads,
          totalClients,
          totalBdaMembers,
        },
        leadStatusBreakdown,
        monthlyLeadsTrend,
        topPerformingBdas: topBdasRaw,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching admin dashboard',
      data: null,
    });
  }
};

const getBdaDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [myTotalLeads, myClosedDeals] = await Promise.all([
      Lead.countDocuments({ assignedTo: userId }),
      Lead.countDocuments({ assignedTo: userId, status: 'Closed Won' }),
    ]);

    const pipelineAgg = await Lead.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const pipelineMap = Object.fromEntries(
      pipelineAgg.map((p) => [p._id, p.count])
    );

    const pipelineStatus = STATUSES.map((status) => ({
      status,
      count: pipelineMap[status] || 0,
    }));

    return res.status(200).json({
      success: true,
      message: 'BDA dashboard data fetched',
      data: {
        stats: {
          myTotalLeads,
          myClosedDeals,
        },
        pipelineStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching BDA dashboard',
      data: null,
    });
  }
};

module.exports = { getAdminDashboard, getBdaDashboard };
