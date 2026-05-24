const User = require('../models/User');
const Lead = require('../models/Lead');
const {
  getPerformanceForBda,
  getPerformanceMapForBdas,
} = require('../utils/bdaPerformance');

const formatBdaWithPerformance = (user, performance) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  isActive: user.isActive,
  createdAt: user.createdAt,
  totalLeads: performance.totalLeads,
  closedDeals: performance.closedDeals,
  conversionRate: performance.conversionRate,
});

const getBdaUsers = async (req, res) => {
  try {
    const bdas = await User.find({ role: 'BDA', isActive: true })
      .select('name email')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: 'BDA users fetched successfully',
      data: {
        users: bdas.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching BDA users',
      data: null,
    });
  }
};

const getAllBdaMembers = async (req, res) => {
  try {
    const bdas = await User.find({ role: 'BDA' })
      .select('name email isActive createdAt')
      .sort({ name: 1 });

    const performanceMap = await getPerformanceMapForBdas();

    const members = bdas.map((bda) => {
      const performance = performanceMap[bda._id.toString()] || {
        totalLeads: 0,
        closedDeals: 0,
        conversionRate: 0,
      };
      return formatBdaWithPerformance(bda, performance);
    });

    return res.status(200).json({
      success: true,
      message: 'BDA team members fetched successfully',
      data: { members },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching team members',
      data: null,
    });
  }
};

const getBdaPerformance = async (req, res) => {
  try {
    const bda = await User.findOne({ _id: req.params.id, role: 'BDA' }).select(
      'name email isActive createdAt'
    );

    if (!bda) {
      return res.status(404).json({
        success: false,
        message: 'BDA member not found',
        data: null,
      });
    }

    const performance = await getPerformanceForBda(bda._id);

    const statusBreakdown = await Lead.aggregate([
      { $match: { assignedTo: bda._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const recentLeads = await Lead.find({ assignedTo: bda._id })
      .select('name company status createdAt')
      .sort({ updatedAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      message: 'BDA performance fetched successfully',
      data: {
        member: formatBdaWithPerformance(bda, performance),
        statusBreakdown: statusBreakdown.map((s) => ({
          status: s._id,
          count: s.count,
        })),
        recentLeads: recentLeads.map((lead) => ({
          id: lead._id,
          name: lead.name,
          company: lead.company,
          status: lead.status,
          createdAt: lead.createdAt,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching BDA performance',
      data: null,
    });
  }
};

const deactivateBda = async (req, res) => {
  try {
    const bda = await User.findOne({ _id: req.params.id, role: 'BDA' });

    if (!bda) {
      return res.status(404).json({
        success: false,
        message: 'BDA member not found',
        data: null,
      });
    }

    if (bda.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'This member is already deactivated',
        data: null,
      });
    }

    bda.isActive = false;
    await bda.save();

    const performance = await getPerformanceForBda(bda._id);

    return res.status(200).json({
      success: true,
      message: 'BDA member deactivated successfully',
      data: {
        member: formatBdaWithPerformance(bda, performance),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deactivating BDA member',
      data: null,
    });
  }
};

module.exports = {
  getBdaUsers,
  getAllBdaMembers,
  getBdaPerformance,
  deactivateBda,
};
