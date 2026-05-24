const Lead = require('../models/Lead');

const computePerformance = (totalLeads, closedDeals) => {
  const conversionRate =
    totalLeads > 0
      ? Math.round((closedDeals / totalLeads) * 1000) / 10
      : 0;

  return { totalLeads, closedDeals, conversionRate };
};

const getPerformanceForBda = async (bdaId) => {
  const [totalLeads, closedDeals] = await Promise.all([
    Lead.countDocuments({ assignedTo: bdaId }),
    Lead.countDocuments({ assignedTo: bdaId, status: 'Closed Won' }),
  ]);

  return computePerformance(totalLeads, closedDeals);
};

const getPerformanceMapForBdas = async () => {
  const stats = await Lead.aggregate([
    { $match: { assignedTo: { $ne: null } } },
    {
      $group: {
        _id: '$assignedTo',
        totalLeads: { $sum: 1 },
        closedDeals: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Closed Won'] }, 1, 0],
          },
        },
      },
    },
  ]);

  return Object.fromEntries(
    stats.map((s) => [
      s._id.toString(),
      computePerformance(s.totalLeads, s.closedDeals),
    ])
  );
};

module.exports = {
  computePerformance,
  getPerformanceForBda,
  getPerformanceMapForBdas,
};
