import mongoose from 'mongoose';

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  description: {
    type: String,
  },
  openingTime: {
    type: String,
    default: '09:00',
  },
  closingTime: {
    type: String,
    default: '23:00',
  },
  deliveryRadius: {
    type: Number,
    default: 5,
  },
  deliveryTime: {
    type: String,
    default: '30 mins',
  },
  minimumOrder: {
    type: Number,
    default: 0,
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);