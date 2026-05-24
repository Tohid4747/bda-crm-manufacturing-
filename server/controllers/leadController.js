const Lead = require('../models/Lead');
const User = require('../models/User');

const { STATUSES } = Lead;

const formatLeads = (leads) => leads.map((lead) => lead.toResponseObject());

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

const createLead = async (req, res) => {
  try {
    const { name, company, contact, email, status, assignedTo, notes } =
      req.body;

    if (!name || !company) {
      return res.status(400).json({
        success: false,
        message: 'Name and company are required',
        data: null,
      });
    }

    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
        data: null,
      });
    }

    if (assignedTo) {
      const bda = await User.findOne({ _id: assignedTo, role: 'BDA' });
      if (!bda) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user must be a valid BDA',
          data: null,
        });
      }
    }

    const lead = await Lead.create({
      name,
      company,
      contact,
      email,
      status: status || 'New',
      assignedTo: assignedTo || null,
      notes,
    });

    const populated = await Lead.findById(lead._id).populate(
      'assignedTo',
      'name email'
    );

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: { lead: populated.toResponseObject() },
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
      message: 'Server error while creating lead',
      data: null,
    });
  }
};

const getLeads = async (req, res) => {
  try {
    const { status, assignedTo, dateFrom, dateTo, search } = req.query;
    const filter = {};

    if (!isAdmin(req.user)) {
      filter.assignedTo = req.user._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo === 'unassigned' ? null : assignedTo;
    }

    if (status) {
      filter.status = status;
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { company: regex }];
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Leads fetched successfully',
      data: { leads: formatLeads(leads) },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching leads',
      data: null,
    });
  }
};

const updateLead = async (req, res) => {
  try {
    const lead = await findLeadForUser(req.params.id, req.user);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found or access denied',
        data: null,
      });
    }

    const { name, company, contact, email, status, notes } = req.body;

    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
        data: null,
      });
    }

    if (isAdmin(req.user)) {
      const { assignedTo } = req.body;
      if (assignedTo !== undefined) {
        if (assignedTo === null || assignedTo === '') {
          lead.assignedTo = null;
        } else {
          const bda = await User.findOne({ _id: assignedTo, role: 'BDA' });
          if (!bda) {
            return res.status(400).json({
              success: false,
              message: 'Assigned user must be a valid BDA',
              data: null,
            });
          }
          lead.assignedTo = assignedTo;
        }
      }
    }

    if (name !== undefined) lead.name = name;
    if (company !== undefined) lead.company = company;
    if (contact !== undefined) lead.contact = contact;
    if (email !== undefined) lead.email = email;
    if (status !== undefined) lead.status = status;
    if (notes !== undefined) lead.notes = notes;

    await lead.save();

    const updated = await Lead.findById(lead._id).populate(
      'assignedTo',
      'name email'
    );

    return res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead: updated.toResponseObject() },
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
      message: 'Server error while updating lead',
      data: null,
    });
  }
};

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
        data: null,
      });
    }

    await lead.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting lead',
      data: null,
    });
  }
};

const assignLead = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide assignedTo (BDA user id)',
        data: null,
      });
    }

    const bda = await User.findOne({ _id: assignedTo, role: 'BDA' });
    if (!bda) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user must be a valid BDA',
        data: null,
      });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
        data: null,
      });
    }

    lead.assignedTo = assignedTo;
    await lead.save();

    const updated = await Lead.findById(lead._id).populate(
      'assignedTo',
      'name email'
    );

    return res.status(200).json({
      success: true,
      message: 'Lead assigned successfully',
      data: { lead: updated.toResponseObject() },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while assigning lead',
      data: null,
    });
  }
};

module.exports = {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
  assignLead,
};
