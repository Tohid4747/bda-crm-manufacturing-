const Activity = require('../models/Activity');
const Lead = require('../models/Lead');
const { ACTIVITY_TYPES } = Activity;
const { isAdmin, findLeadForUser } = require('../utils/leadAccess');

const formatActivities = (activities) =>
  activities.map((a) => a.toResponseObject());

const populateOptions = [
  { path: 'leadId', select: 'name company assignedTo' },
  { path: 'createdBy', select: 'name email' },
];

const createActivity = async (req, res) => {
  try {
    const { leadId, type, notes, followUpDate } = req.body;

    if (!leadId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leadId and type',
        data: null,
      });
    }

    if (!ACTIVITY_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be Call, Email, or Meeting',
        data: null,
      });
    }

    const lead = await findLeadForUser(leadId, req.user);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or access denied',
        data: null,
      });
    }

    const activity = await Activity.create({
      leadId,
      type,
      notes: notes || '',
      followUpDate: followUpDate || null,
      createdBy: req.user._id,
    });

    const populated = await Activity.findById(activity._id).populate(
      populateOptions
    );

    return res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: { activity: populated.toResponseObject() },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(', ');
      return res.status(400).json({
        success: false,
        message,
        data: null,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while logging activity',
      data: null,
    });
  }
};

const getActivitiesByLead = async (req, res) => {
  try {
    const lead = await findLeadForUser(req.params.leadId, req.user);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or access denied',
        data: null,
      });
    }

    const activities = await Activity.find({ leadId: lead._id })
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Activities fetched successfully',
      data: { activities: formatActivities(activities) },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching activities',
      data: null,
    });
  }
};

const getUpcomingActivities = async (req, res) => {
  try {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const activityFilter = {
      followUpDate: { $ne: null, $lte: endOfToday },
    };

    let accessibleLeadIds = null;

    if (!isAdmin(req.user)) {
      const leads = await Lead.find({ assignedTo: req.user._id }).select('_id');
      accessibleLeadIds = leads.map((l) => l._id);

      if (accessibleLeadIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Upcoming follow-ups fetched successfully',
          data: { activities: [] },
        });
      }

      activityFilter.leadId = { $in: accessibleLeadIds };
    }

    const activities = await Activity.find(activityFilter)
      .populate(populateOptions)
      .sort({ followUpDate: 1 });

    return res.status(200).json({
      success: true,
      message: 'Upcoming follow-ups fetched successfully',
      data: { activities: formatActivities(activities) },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming follow-ups',
      data: null,
    });
  }
};

module.exports = {
  createActivity,
  getActivitiesByLead,
  getUpcomingActivities,
};
