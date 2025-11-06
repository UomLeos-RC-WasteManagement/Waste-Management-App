const mongoose = require('mongoose');

const wastePurchaseSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collector',
      required: true
    },
    wasteType: {
      type: String,
      enum: ['E-waste', 'Plastic', 'Polythene', 'Glass', 'Paper', 'Metal', 'Organic'],
      required: true
    },
    quantity: {
      value: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        default: 'kg'
      }
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    },
    pickupDate: {
      type: Date
    },
    notes: {
      type: String
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number]
      }
    }
  },
  {
    timestamps: true
  }
);

// Index for location-based queries
wastePurchaseSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('WastePurchase', wastePurchaseSchema);
