import bcrypt from 'bcryptjs';
import Category from './models/Category';
import Product from './models/Product';
import User from './models/User';
import connectDB from './mongodb';

export async function seedDatabase() {
  await connectDB();

  // Seed Admin User
  const adminExists = await User.findOne({ email: 'redwan.rakib264@gmail.com' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    await User.create({
      email: 'redwan.rakib264@gmail.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+8801234567890',
      role: 'admin',
      isActive: true,
      profileImage: '', // Initialize as empty string
    });
    // console.log('Admin user seeded');
  }

  // Seed Categories
  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets and electronic devices',
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Trendy clothing and accessories',
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Furniture and home decor items',
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
      description: 'Sports equipment and fitness gear',
      isActive: true,
      sortOrder: 4,
    },
    {
      name: 'Books & Education',
      slug: 'books-education',
      description: 'Educational materials and books',
      isActive: true,
      sortOrder: 5,
    },
    {
      name: 'Health & Beauty',
      slug: 'health-beauty',
      description: 'Health and beauty products',
      isActive: true,
      sortOrder: 6,
    },
  ];

  for (const categoryData of categories) {
    const exists = await Category.findOne({ slug: categoryData.slug });
    if (!exists) {
      await Category.create(categoryData);
    }
  }

  // Get category IDs for products
  const electronicsCategory = await Category.findOne({ slug: 'electronics' });
  const fashionCategory = await Category.findOne({ slug: 'fashion' });
  const homeCategory = await Category.findOne({ slug: 'home-living' });

  // Seed Products
  const products = [
    {
      name: 'Premium Wireless Headphones',
      slug: 'premium-wireless-headphones',
      description: 'High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.',
      shortDescription: 'Premium wireless headphones with noise cancellation',
      category: electronicsCategory?._id,
      price: 8999,
      comparePrice: 12999,
      sku: 'PWH-001',
      trackQuantity: true,
      quantity: 50,
      images: ['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=800'],
      isActive: true,
      isFeatured: true,
      tags: ['wireless', 'audio', 'premium', 'noise-cancellation'],
      averageRating: 4.8,
      totalSales: 124,
    },
    {
      name: 'Smart Fitness Watch',
      slug: 'smart-fitness-watch',
      description: 'Advanced fitness tracking watch with heart rate monitoring, GPS, and smart notifications. Track your health and stay connected.',
      shortDescription: 'Advanced fitness tracking with heart rate monitoring',
      category: electronicsCategory?._id,
      price: 15999,
      comparePrice: 19999,
      sku: 'SFW-002',
      trackQuantity: true,
      quantity: 30,
      images: ['https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=800'],
      isActive: true,
      isFeatured: true,
      tags: ['fitness', 'smart', 'watch', 'health'],
      averageRating: 4.6,
      totalSales: 89,
    },
    {
      name: 'Professional Camera Lens',
      slug: 'professional-camera-lens',
      description: 'Professional grade camera lens for stunning photography. Compatible with major camera brands and perfect for professional photographers.',
      shortDescription: 'Professional grade camera lens for stunning photography',
      category: electronicsCategory?._id,
      price: 25999,
      comparePrice: 32999,
      sku: 'PCL-003',
      trackQuantity: true,
      quantity: 15,
      images: ['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800'],
      isActive: true,
      isFeatured: true,
      tags: ['camera', 'lens', 'professional', 'photography'],
      averageRating: 4.9,
      totalSales: 67,
    },
    {
      name: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      description: 'Comfortable ergonomic office chair designed for long working hours. Features lumbar support and adjustable height.',
      shortDescription: 'Comfortable ergonomic chair for long working hours',
      category: homeCategory?._id,
      price: 18999,
      comparePrice: 24999,
      sku: 'EOC-004',
      trackQuantity: true,
      quantity: 25,
      images: ['https://images.pexels.com/photos/586762/pexels-photo-586762.jpeg?auto=compress&cs=tinysrgb&w=800'],
      isActive: true,
      isFeatured: true,
      tags: ['office', 'chair', 'ergonomic', 'furniture'],
      averageRating: 4.7,
      totalSales: 156,
    },
    {
      name: 'Wireless Gaming Mouse',
      slug: 'wireless-gaming-mouse',
      description: 'High-precision wireless gaming mouse with customizable buttons and RGB lighting. Perfect for gamers and professionals.',
      shortDescription: 'High-precision gaming mouse with customizable buttons',
      category: electronicsCategory?._id,
      price: 4999,
      comparePrice: 6999,
      sku: 'WGM-005',
      trackQuantity: true,
      quantity: 100,
      images: ['https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=800'],
      isActive: true,
      isFeatured: true,
      tags: ['gaming', 'mouse', 'wireless', 'rgb'],
      averageRating: 4.5,
      totalSales: 203,
    },
    {
      name: 'Premium Coffee Machine',
      slug: 'premium-coffee-machine',
      description: 'Professional coffee machine for perfect brewing. Features multiple brewing options and premium build quality.',
      shortDescription: 'Professional coffee machine for perfect brewing',
      category: homeCategory?._id,
      price: 35999,
      comparePrice: 42999,
      sku: 'PCM-006',
      trackQuantity: true,
      quantity: 10,
      images: ['https://images.pexels.com/photos/4109743/pexels-photo-4109743.jpeg?auto=compress&cs=tinysrgb&w=800'],
      isActive: true,
      isFeatured: true,
      tags: ['coffee', 'machine', 'premium', 'brewing'],
      averageRating: 4.8,
      totalSales: 98,
    },
  ];

  for (const productData of products) {
    const exists = await Product.findOne({ slug: productData.slug });
    if (!exists) {
      await Product.create(productData);
    }
  }

  // console.log('Database seeded successfully');
}