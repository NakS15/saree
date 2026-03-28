const mongoose = require('mongoose');
const slugify  = require('slugify');

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  description: String,
  image:       String,
  parent:      { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  order:       { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  metaTitle:       String,
  metaDescription: String,
}, { timestamps: true });

categorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
