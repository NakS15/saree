require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const logger    = require('../config/logger');

const User     = require('../models/User.model');
const Vendor   = require('../models/Vendor.model');
const Category = require('../models/Category.model');
const Product  = require('../models/Product.model');

// ─── Seed data ─────────────────────────────────────────────────────────────────
const categories = [
  { name: 'Silk Sarees',      slug: 'silk-sarees',      order: 1 },
  { name: 'Cotton Sarees',    slug: 'cotton-sarees',    order: 2 },
  { name: 'Bridal Sarees',    slug: 'bridal-sarees',    order: 3 },
  { name: 'Designer Sarees',  slug: 'designer-sarees',  order: 4 },
  { name: 'Georgette Sarees', slug: 'georgette-sarees', order: 5 },
  { name: 'Kanjivaram Sarees',slug: 'kanjivaram-sarees',order: 6 },
  { name: 'Banarasi Sarees',  slug: 'banarasi-sarees',  order: 7 },
  { name: 'Chanderi Sarees',  slug: 'chanderi-sarees',  order: 8 },
  { name: 'Handloom Sarees',  slug: 'handloom-sarees',  order: 9 },
];

const users = [
  { name: 'Admin User',     email: 'admin@sareebazaar.com',  password: 'Admin@1234',  role: 'admin',    isEmailVerified: true },
  { name: 'Priya Textiles', email: 'vendor@sareebazaar.com', password: 'Vendor@1234', role: 'vendor',   isEmailVerified: true },
  { name: 'Ananya Sharma',  email: 'user@sareebazaar.com',   password: 'User@1234',   role: 'customer', isEmailVerified: true },
];

const importData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  logger.info('MongoDB connected for seeding');

  // Clear existing
  await Promise.all([User.deleteMany(), Vendor.deleteMany(), Category.deleteMany(), Product.deleteMany()]);
  logger.info('Existing data cleared');

  // Insert categories
  const createdCats = await Category.insertMany(categories);
  logger.info(`${createdCats.length} categories seeded`);

  // Insert users
  const createdUsers = await User.insertMany(users);
  logger.info(`${createdUsers.length} users seeded`);

  const vendorUser = createdUsers.find((u) => u.role === 'vendor');

  // Insert vendor profile
  const vendor = await Vendor.create({
    user:             vendorUser._id,
    businessName:     'Priya Textiles',
    slug:             'priya-textiles',
    businessEmail:    'vendor@sareebazaar.com',
    businessDescription: 'Premium handloom and silk sarees from Varanasi, India.',
    status:           'active',
    kyc:              { status: 'approved' },
    rating:           4.5,
    businessAddress:  { city: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001' },
  });
  logger.info('Vendor seeded');

  const silkCat   = createdCats.find((c) => c.slug === 'silk-sarees');
  const bridalCat = createdCats.find((c) => c.slug === 'bridal-sarees');
  const cottonCat = createdCats.find((c) => c.slug === 'cotton-sarees');

  // Insert sample products
  const products = [
    {
      vendor: vendor._id, category: silkCat._id,
      name: 'Kanjivaram Pure Silk Saree - Royal Red', slug: 'kanjivaram-pure-silk-saree-royal-red-' + Date.now(),
      description: 'Exquisite handwoven Kanjivaram pure silk saree with traditional temple border. Perfect for weddings and special occasions.',
      price: 18500, compareAtPrice: 24000, stock: 15,
      images: [{ url: 'https://images.unsplash.com/photo-1610189352649-c0c5e0e9d2e5?w=800', isPrimary: true }],
      colors: ['Red', 'Maroon'], isFeatured: true, isTrending: true, status: 'active', rating: 4.8, numReviews: 45,
      attributes: { fabric: 'Silk', workType: 'Zari', occasion: ['Wedding', 'Festival', 'Bridal'], length: 5.5, blousePieceIncluded: true, origin: 'Kanchipuram', careInstructions: 'Dry clean only' },
    },
    {
      vendor: vendor._id, category: bridalCat._id,
      name: 'Banarasi Silk Bridal Saree - Gold Zari', slug: 'banarasi-silk-bridal-saree-gold-zari-' + Date.now(),
      description: 'Stunning Banarasi silk saree with intricate gold zari work. A must-have for every bride.',
      price: 22000, compareAtPrice: 30000, stock: 8,
      images: [{ url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800', isPrimary: true }],
      colors: ['Gold', 'Maroon', 'Pink'], isFeatured: true, status: 'active', rating: 4.9, numReviews: 67,
      attributes: { fabric: 'Banarasi', workType: 'Zari', occasion: ['Wedding', 'Bridal'], length: 6, blousePieceIncluded: true, origin: 'Varanasi', careInstructions: 'Dry clean only' },
    },
    {
      vendor: vendor._id, category: cottonCat._id,
      name: 'Pure Cotton Handloom Saree - Pastel Blue', slug: 'pure-cotton-handloom-saree-pastel-blue-' + Date.now(),
      description: 'Lightweight and breathable pure cotton handloom saree. Perfect for daily wear and office.',
      price: 2200, compareAtPrice: 3000, stock: 50,
      images: [{ url: 'https://images.unsplash.com/photo-1519235624215-85175d5eb36e?w=800', isPrimary: true }],
      colors: ['Blue', 'White', 'Yellow'], isTrending: true, status: 'active', rating: 4.5, numReviews: 123,
      attributes: { fabric: 'Cotton', workType: 'Handloom', occasion: ['Casual', 'Office'], length: 5.5, blousePieceIncluded: true, origin: 'West Bengal', careInstructions: 'Hand wash cold' },
    },
    {
      vendor: vendor._id, category: silkCat._id,
      name: 'Mysore Silk Saree - Emerald Green', slug: 'mysore-silk-saree-emerald-green-' + Date.now(),
      description: 'Classic Mysore silk saree known for its smooth texture and rich golden border.',
      price: 8500, compareAtPrice: 11000, stock: 20,
      images: [{ url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800', isPrimary: true }],
      colors: ['Green', 'Purple', 'Pink'], isFeatured: true, status: 'active', rating: 4.6, numReviews: 34,
      attributes: { fabric: 'Silk', workType: 'Woven', occasion: ['Festival', 'Party', 'Religious'], length: 5.5, blousePieceIncluded: true, origin: 'Mysore', careInstructions: 'Dry clean only' },
    },
  ];

  await Product.insertMany(products);
  logger.info(`${products.length} products seeded`);

  logger.info('\n✅ Database seeded successfully!');
  logger.info('─────────────────────────────────────────');
  logger.info('Admin:    admin@sareebazaar.com  / Admin@1234');
  logger.info('Vendor:   vendor@sareebazaar.com / Vendor@1234');
  logger.info('Customer: user@sareebazaar.com   / User@1234');
  logger.info('─────────────────────────────────────────\n');

  process.exit(0);
};

const destroyData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Vendor.deleteMany(), Category.deleteMany(), Product.deleteMany()]);
  logger.info('✅ All data destroyed');
  process.exit(0);
};

if (process.argv[2] === '--destroy') destroyData();
else importData();
