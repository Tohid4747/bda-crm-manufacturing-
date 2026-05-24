const mongoose = require('mongoose');

const ACTIVITY_TYPES = ['Call', 'Email', 'Meeting'];

const activitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead is required'],
    },
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: [true, 'Activity type is required'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

activitySchema.methods.toResponseObject = function toResponseObject() {
  const lead = this.leadId;
  const creator = this.createdBy;

  const leadInfo =
    lead && typeof lead === 'object' && lead._id
      ? {
          id: lead._id,
          name: lead.name,
          company: lead.company,
        }
      : lead
        ? { id: lead }
        : null;

  const createdByUser =
    creator && typeof creator === 'object' && creator._id
      ? {
          id: creator._id,
          name: creator.name,
          email: creator.email,
        }
      : creator
        ? { id: creator }
        : null;

  return {
    id: this._id,
    leadId: leadInfo?.id || this.leadId,
    lead: leadInfo,
    type: this.type,
    notes: this.notes,
    followUpDate: this.followUpDate,
    createdBy: createdByUser,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Activity', activitySchema);
module.exports.ACTIVITY_TYPES = ACTIVITY_TYPES;
