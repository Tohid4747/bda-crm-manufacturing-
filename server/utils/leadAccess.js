const Lead = require('../models/Lead');

const isAdmin = (user) => user.role === 'Admin';

const findLeadForUser = async (id, user) => {
  const lead = await Lead.findById(id).populate('assignedTo', 'name email');
  if (!lead) return null;

  if (isAdmin(user)) return lead;

  if (
    lead.assignedTo &&
    lead.assignedTo._id.toString() === user._id.toString()
  ) {
    return lead;
  }

  return null;
};

module.exports = { isAdmin, findLeadForUser };
