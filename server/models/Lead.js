const mongoose = require('mongoose');

const STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Closed Won',
  'Closed Lost',
];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
    },
    contact: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'New',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

leadSchema.methods.toResponseObject = function toResponseObject() {
  const assigned = this.assignedTo;
  const assignedUser =
    assigned && typeof assigned === 'object' && assigned._id
      ? {
          id: assigned._id,
          name: assigned.name,
          email: assigned.email,
        }
      : assigned
        ? { id: assigned }
        : null;

  return {
    id: this._id,
    name: this.name,
    company: this.company,
    contact: this.contact,
    email: this.email,
    status: this.status,
    assignedTo: assignedUser,
    notes: this.notes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Lead', leadSchema);
module.exports.STATUSES = STATUSES;
