const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
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
    dealValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    convertedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
  },
  { timestamps: true }
);

clientSchema.index({ convertedFrom: 1 }, { unique: true, sparse: true });

clientSchema.methods.toResponseObject = function toResponseObject() {
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

  const lead = this.convertedFrom;
  const convertedLead =
    lead && typeof lead === 'object' && lead._id
      ? {
          id: lead._id,
          name: lead.name,
          company: lead.company,
        }
      : lead
        ? { id: lead }
        : null;

  return {
    id: this._id,
    name: this.name,
    company: this.company,
    contact: this.contact,
    email: this.email,
    dealValue: this.dealValue,
    assignedTo: assignedUser,
    convertedFrom: convertedLead,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Client', clientSchema);
