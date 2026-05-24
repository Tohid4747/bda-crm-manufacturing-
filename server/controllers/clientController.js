const Client = require('../models/Client');

const isAdmin = (user) => user.role === 'Admin';

const formatClients = (clients) =>
  clients.map((client) => client.toResponseObject());

const populateOptions = [
  { path: 'assignedTo', select: 'name email' },
  { path: 'convertedFrom', select: 'name company' },
];

const getClients = async (req, res) => {
  try {
    const filter = {};

    if (!isAdmin(req.user)) {
      filter.assignedTo = req.user._id;
    }

    const clients = await Client.find(filter)
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Clients fetched successfully',
      data: { clients: formatClients(clients) },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching clients',
      data: null,
    });
  }
};

const getClientById = async (req, res) => {
  try {
    const filter = { _id: req.params.id };

    if (!isAdmin(req.user)) {
      filter.assignedTo = req.user._id;
    }

    const client = await Client.findOne(filter).populate(populateOptions);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found or access denied',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Client fetched successfully',
      data: { client: client.toResponseObject() },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching client',
      data: null,
    });
  }
};

module.exports = { getClients, getClientById };
