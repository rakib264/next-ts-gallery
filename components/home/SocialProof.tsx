'use client';

import { motion } from 'framer-motion';
import { MoreHorizontal, Star } from 'lucide-react';

export default function SocialProof() {
  const socialReviews = [
    {
      platform: "facebook",
      platformName: "Facebook",
      platformColor: "bg-blue-600",
      platformIcon: "📘",
      customer: {
        name: "রাহিমা খাতুন",
        nameEn: "Rahima Khatun",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        location: "Dhaka, Bangladesh",
        verified: true
      },
      message: "অসাধারণ quality! আমার order টা ২ দিনেই পেয়ে গেছি। Size perfect fit হয়েছে। TSR Gallery এর service really impressive! 💯",
      messageEn: "Amazing quality! Got my order in just 2 days. Perfect fit. TSR Gallery's service is really impressive! 💯",
      likes: 23,
      comments: 8,
      shares: 3,
      timeAgo: "2h",
      rating: 5,
      productImage: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=200&fit=crop&auto=format&q=80"
    },
    {
      platform: "messenger",
      platformName: "Messenger",
      platformColor: "bg-blue-500",
      platformIcon: "💬",
      customer: {
        name: "করিম আহমেদ",
        nameEn: "Karim Ahmed",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        location: "Chittagong, Bangladesh",
        verified: false
      },
      message: "ভাইয়া, আপনার website থেকে যে shirt কিনেছি, সেটা দেখে সবাই প্রশংসা করছে! Quality আর price দুটোই perfect। Definitely recommend করবো!",
      messageEn: "Bro, everyone is praising the shirt I bought from your website! Both quality and price are perfect. Will definitely recommend!",
      likes: 15,
      comments: 5,
      shares: 2,
      timeAgo: "4h",
      rating: 5,
      productImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop&auto=format&q=80"
    },
    {
      platform: "instagram",
      platformName: "Instagram",
      platformColor: "bg-gradient-to-r from-purple-500 to-pink-500",
      platformIcon: "📷",
      customer: {
        name: "ফাতেমা বেগম",
        nameEn: "Fatema Begum",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        location: "Sylhet, Bangladesh",
        verified: true
      },
      message: "TSR Gallery থেকে কিনা dress টা দেখে সবাই জিজ্ঞেস করছে কোথা থেকে কিনেছি! 😍 Quality top-notch, delivery super fast. Love it! 💕",
      messageEn: "Everyone is asking where I bought this dress from TSR Gallery! 😍 Quality is top-notch, delivery super fast. Love it! 💕",
      likes: 47,
      comments: 12,
      shares: 7,
      timeAgo: "6h",
      rating: 5,
      productImage: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=200&fit=crop&auto=format&q=80"
    },
    {
      platform: "facebook",
      platformName: "Facebook",
      platformColor: "bg-blue-600",
      platformIcon: "📘",
      customer: {
        name: "নাসির উদ্দিন",
        nameEn: "Nasir Uddin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        location: "Rajshahi, Bangladesh",
        verified: false
      },
      message: "Customer service একদম excellent! আমার order এ problem ছিল, তারা immediately solve করে দিয়েছে। TSR Gallery এর প্রতি আমার full trust!",
      messageEn: "Customer service is absolutely excellent! Had a problem with my order, they solved it immediately. I have full trust in TSR Gallery!",
      likes: 31,
      comments: 9,
      shares: 4,
      timeAgo: "1d",
      rating: 5,
      productImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop&auto=format&q=80"
    },
    {
      platform: "messenger",
      platformName: "Messenger",
      platformColor: "bg-blue-500",
      platformIcon: "💬",
      customer: {
        name: "সালমা আক্তার",
        nameEn: "Salma Akter",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        location: "Khulna, Bangladesh",
        verified: true
      },
      message: "আমার first online shopping experience TSR Gallery এর সাথে। ভয় ছিল কিন্তু result amazing! Product exactly same as shown. Highly satisfied! 👍",
      messageEn: "My first online shopping experience with TSR Gallery. Was scared but the result is amazing! Product exactly same as shown. Highly satisfied! 👍",
      likes: 19,
      comments: 6,
      shares: 3,
      timeAgo: "2d",
      rating: 5,
      productImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=200&fit=crop&auto=format&q=80"
    },
    {
      platform: "instagram",
      platformName: "Instagram",
      platformColor: "bg-gradient-to-r from-purple-500 to-pink-500",
      platformIcon: "📷",
      customer: {
        name: "মাহমুদ হাসান",
        nameEn: "Mahmud Hasan",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        location: "Barisal, Bangladesh",
        verified: false
      },
      message: "TSR Gallery এর collection দেখে impressed! Fashion sense আর quality দুটোই perfect। Price reasonable, delivery quick. Perfect online store! ✨",
      messageEn: "Impressed by TSR Gallery's collection! Both fashion sense and quality are perfect. Reasonable price, quick delivery. Perfect online store! ✨",
      likes: 38,
      comments: 11,
      shares: 5,
      timeAgo: "3d",
      rating: 5,
      productImage: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop&auto=format&q=80"
    }
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers" },
    { number: "4.6/5", label: "Average Rating" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-200/40 to-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-yellow-200/30 to-orange-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-green-200/30 to-teal-200/30 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-6">
            <span className="text-2xl">⭐</span>
            <span className="text-sm font-semibold text-gray-700">4.6/5 Average Rating</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 lg:mb-8">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Trusted by 10K+ Customers
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-4xl md:max-w-5xl mx-auto leading-relaxed px-4 mb-6 md:mb-8">
            See what our amazing customers are saying about us on social media. Real reviews from real people across Bangladesh.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Live Reviews
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Verified Customers
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Real Experiences
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-16 md:mb-20 lg:mb-24"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              className="text-center p-4 md:p-6 lg:p-8 bg-white/90 backdrop-blur-sm border border-white/70 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl hover:shadow-2xl md:hover:shadow-3xl transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 md:mb-4 group-hover:scale-110 transition-transform duration-500">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 font-semibold">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Social Media Reviews Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
        >
          {socialReviews.map((review, index) => (
            <motion.div
              key={`${review.platform}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl hover:shadow-2xl md:hover:shadow-3xl transition-all duration-500 overflow-hidden border border-gray-100/50 group h-full flex flex-col"
            >
              {/* Platform Header */}
              <div className={`${review.platformColor} px-3 md:px-4 lg:px-5 py-3 md:py-4 flex items-center justify-between relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                <div className="flex items-center gap-2 md:gap-3 relative z-10">
                  <div className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm md:text-base lg:text-lg">{review.platformIcon}</span>
                  </div>
                  <div>
                    <div className="text-white font-bold text-xs md:text-sm">{review.platformName}</div>
                    <div className="text-white/90 text-xs font-medium">{review.timeAgo}</div>
                  </div>
                </div>
                <MoreHorizontal className="text-white/80 hover:text-white transition-colors duration-200" size={16} />
              </div>

              {/* Customer Info */}
              <div className="px-3 md:px-4 lg:px-5 py-3 md:py-4 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
                <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={review.customer.avatar} 
                      alt={review.customer.nameEn}
                      className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full object-cover border-2 md:border-3 border-white shadow-lg ring-1 md:ring-2 ring-gray-100"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${review.customer.nameEn}&background=6366f1&color=fff&size=150`;
                      }}
                    />
                    {review.customer.verified && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 md:gap-2 mb-1">
                      <div className="font-bold text-gray-900 text-sm md:text-base truncate">{review.customer.name}</div>
                      {review.customer.verified && (
                        <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-600 text-xs md:text-sm font-medium truncate">{review.customer.nameEn}</div>
                    <div className="text-gray-500 text-xs flex items-center gap-1 font-medium">
                      <span className="text-blue-500">📍</span>
                      <span className="truncate">{review.customer.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 md:px-3 py-1 rounded-full flex-shrink-0">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={12} />
                    ))}
                    <span className="text-xs font-semibold text-gray-700 ml-1">{review.rating}.0</span>
                  </div>
                </div>
              </div>

              {/* Review Message */}
              <div className="px-3 md:px-4 lg:px-5 py-3 md:py-4 lg:py-5 flex-1 flex flex-col">
                <p className="text-gray-800 text-xs md:text-sm leading-relaxed font-medium flex-1">
                  {review.message}
                </p>
                
              </div>

            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 md:mt-20 text-center"
        >
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 md:mb-8">Why Customers Trust TSR Gallery</h3>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 lg:gap-6 xl:gap-8">
            {[
              { icon: "🔒", text: "SSL Secured" },
              { icon: "🚚", text: "Free Shipping" },
              { icon: "↩️", text: "Easy Returns" },
              { icon: "💬", text: "24/7 Support" },
              { icon: "⭐", text: "Quality Guaranteed" },
              { icon: "🇧🇩", text: "Made for Bangladesh" }
            ].map((badge, index) => (
              <motion.div
                key={badge.text}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 md:px-4 lg:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center gap-1 md:gap-2"
              >
                <span className="text-sm md:text-base lg:text-lg">{badge.icon}</span>
                {badge.text}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
