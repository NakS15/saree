const mongoose = require('mongoose');
const slugify  = require('slugify');

const imageSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  publicId:  String,
  alt:       String,
  isPrimary: { type: Boolean, default: false },
}, { _id: false });

const productSchema = new mongoose.Schema({
  vendor:   { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },

  name:        { type: String, required: [true, 'Product name required'], trim: true, maxlength: 200 },
  slug:        { type: String, unique: true },
  description: { type: String, required: [true, 'Description required'], maxlength: 5000 },
  shortDescription: { type: String, maxlength: 300 },

  price:          { type: Number, required: [true, 'Price required'], min: 0 },
  compareAtPrice: { type: Number, min: 0 },

  images: [imageSchema],
  colors: [String],

  stock:      { type: Number, required: true, default: 0, min: 0 },
  sku:        { type: String, sparse: true },
  totalSales: { type: Number, default: 0 },
  views:      { type: Number, default: 0 },

  attributes: {
    fabric:            String,
    workType:          String,
    occasion:          [String],
    length:            Number,
    blousePieceIncluded: { type: Boolean, default: false },
    blouseLength:      Number,
    zariType:          String,
    origin:            String,
    careInstructions:  String,
    weight:            Number,    // grams
    transparency:      { type: String, enum: ['opaque', 'semi-transparent', 'transparent'] },
    washType:          { type: String, enum: ['hand-wash', 'dry-clean', 'machine-wash'] },
  },

  tags:       [String],
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },

  status:    { type: String, enum: ['draft', 'pending_approval', 'active', 'rejected', 'archived'], default: 'draft' },
  adminNote: String,

  rating:     { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },

  metaTitle:       String,
  metaDescription: String,
}, { timestamps: true });

// Text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text', 'attributes.fabric': 'text' });
productSchema.index({ price: 1, rating: -1, totalSales: -1 });
productSchema.index({ vendor: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });

productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
