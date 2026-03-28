const mongoose = require('mongoose');
const slugify  = require('slugify');

const vendorSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName:    { type: String, required: [true, 'Business name is required'], trim: true },
  slug:            { type: String, unique: true },
  businessEmail:   { type: String, lowercase: true },
  businessPhone:   String,
  businessDescription: String,
  logo:            String,
  banner:          String,

  businessAddress: {
    addressLine1: String, addressLine2: String,
    city: String, state: String, pincode: String, country: { type: String, default: 'India' },
  },

  bankDetails: {
    accountHolderName: String,
    accountNumber:     { type: String, select: false },
    ifscCode:          String,
    bankName:          String,
    upiId:             String,
  },

  kyc: {
    panNumber:   String,
    gstNumber:   String,
    aadharNumber:{ type: String, select: false },
    panDocument:   String, // Cloudinary URL
    gstDocument:   String,
    aadharDocument:String,
    status:      { type: String, enum: ['not_submitted', 'submitted', 'approved', 'rejected'], default: 'not_submitted' },
    submittedAt: Date,
    reviewedAt:  Date,
    rejectionReason: String,
  },

  status:          { type: String, enum: ['pending', 'active', 'rejected', 'suspended'], default: 'pending' },
  rejectionReason: String,
  returnPolicy:    { type: String, default: '7-day return policy on unworn, unwashed sarees with tags intact.' },
  shippingPolicy:  String,

  rating:          { type: Number, default: 0, min: 0, max: 5 },
  totalReviews:    { type: Number, default: 0 },
  totalOrders:     { type: Number, default: 0 },
  totalRevenue:    { type: Number, default: 0 },
  commissionRate:  { type: Number, default: 10 },
}, { timestamps: true });

vendorSchema.pre('save', function (next) {
  if (this.isModified('businessName') && !this.slug) {
    this.slug = slugify(this.businessName, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Vendor', vendorSchema);
