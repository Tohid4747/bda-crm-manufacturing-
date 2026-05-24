const Client = require('../models/Client');

const createClientFromLead = async (lead) => {
  const leadId = lead._id || lead.id;

  const existing = await Client.findOne({ convertedFrom: leadId });
  if (existing) {
    return existing;
  }

  return Client.create({
    name: lead.name,
    company: lead.company,
    contact: lead.contact || '',
    email: lead.email || '',
    dealValue: 0,
    assignedTo: lead.assignedTo || null,
    convertedFrom: leadId,
  });
};

module.exports = { createClientFromLead };
