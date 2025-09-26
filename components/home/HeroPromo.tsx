'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Gift, Sparkles, Star, Users } from 'lucide-react';
import Link from 'next/link';

export default function HeroPromo() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Simplified Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle gradient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="w-full">
          {/* Main Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-16 lg:mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6"
            >
              <Sparkles className="text-pink-300" size={16} />
              <span>Premium Fashion Collection</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
                Luxury Fashion
              </span>
              <br />
              <span className="text-white">For Everyone</span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-purple-100 mb-8 leading-relaxed max-w-4xl mx-auto">
              Discover our curated collection of premium fashion for men, women, boys, and girls. 
              Experience luxury, style, and quality in every piece.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold text-base"
                >
                  Explore Collection
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href="/deals">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold text-base"
                >
                  View Deals
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Fashion Categories Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-16"
          >
            {/* Women's Fashion */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group cursor-pointer"
            >
              <Link href="/categories/women">
                <div className="w-full h-32 md:h-40 lg:h-48 bg-gradient-to-br from-pink-500/40 to-rose-500/40 rounded-2xl backdrop-blur-sm border border-white/30 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:from-pink-500/50 group-hover:to-rose-500/50">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative h-full flex flex-col items-center justify-center p-4">
                    <motion.div 
                      className="text-3xl md:text-4xl lg:text-5xl mb-2"
                      animate={{ 
                        y: [0, -5, 0],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      👗
                    </motion.div>
                    <h3 className="text-white font-bold text-sm md:text-base lg:text-lg text-center group-hover:text-pink-100 transition-colors duration-300">Women's</h3>
                    <p className="text-pink-200 text-xs md:text-sm text-center group-hover:text-pink-100 transition-colors duration-300">Elegant</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Men's Fashion */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group cursor-pointer"
            >
              <Link href="/categories/men">
                <div className="w-full h-32 md:h-40 lg:h-48 bg-gradient-to-br from-blue-500/40 to-indigo-500/40 rounded-2xl backdrop-blur-sm border border-white/30 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:from-blue-500/50 group-hover:to-indigo-500/50">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative h-full flex flex-col items-center justify-center p-4">
                    <motion.div 
                      className="text-3xl md:text-4xl lg:text-5xl mb-2"
                      animate={{ 
                        y: [0, -5, 0],
                        rotate: [0, -2, 2, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    >
                      👔
                    </motion.div>
                    <h3 className="text-white font-bold text-sm md:text-base lg:text-lg text-center group-hover:text-blue-100 transition-colors duration-300">Men's</h3>
                    <p className="text-blue-200 text-xs md:text-sm text-center group-hover:text-blue-100 transition-colors duration-300">Sharp</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Boys Fashion */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group cursor-pointer"
            >
              <Link href="/categories/boys">
                <div className="w-full h-32 md:h-40 lg:h-48 bg-gradient-to-br from-green-500/40 to-emerald-500/40 rounded-2xl backdrop-blur-sm border border-white/30 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:from-green-500/50 group-hover:to-emerald-500/50">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative h-full flex flex-col items-center justify-center p-4">
                    <motion.div 
                      className="text-3xl md:text-4xl lg:text-5xl mb-2"
                      animate={{ 
                        y: [0, -5, 0],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 1
                      }}
                    >
                      👦
                    </motion.div>
                    <h3 className="text-white font-bold text-sm md:text-base lg:text-lg text-center group-hover:text-green-100 transition-colors duration-300">Boys</h3>
                    <p className="text-green-200 text-xs md:text-sm text-center group-hover:text-green-100 transition-colors duration-300">Cool</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Girls Fashion */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group cursor-pointer"
            >
              <Link href="/categories/girls">
                <div className="w-full h-32 md:h-40 lg:h-48 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-2xl backdrop-blur-sm border border-white/30 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:from-purple-500/50 group-hover:to-pink-500/50">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative h-full flex flex-col items-center justify-center p-4">
                    <motion.div 
                      className="text-3xl md:text-4xl lg:text-5xl mb-2"
                      animate={{ 
                        y: [0, -5, 0],
                        rotate: [0, -2, 2, 0]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 1.5
                      }}
                    >
                      👧
                    </motion.div>
                    <h3 className="text-white font-bold text-sm md:text-base lg:text-lg text-center group-hover:text-purple-100 transition-colors duration-300">Girls</h3>
                    <p className="text-purple-200 text-xs md:text-sm text-center group-hover:text-purple-100 transition-colors duration-300">Cute</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Section - Hidden on Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="hidden md:grid grid-cols-3 gap-6 lg:gap-8 xl:gap-12"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-center p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 group"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Users className="text-pink-300 mx-auto mb-3 group-hover:text-pink-200 transition-colors duration-300" size={28} />
              </motion.div>
              <div className="text-2xl lg:text-3xl font-bold mb-1 bg-gradient-to-r from-pink-300 to-pink-200 bg-clip-text text-transparent">10K+</div>
              <div className="text-sm text-purple-200 group-hover:text-purple-100 transition-colors duration-300">Happy Customers</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-center p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 group"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <Star className="text-yellow-300 mx-auto mb-3 group-hover:text-yellow-200 transition-colors duration-300" size={28} />
              </motion.div>
              <div className="text-2xl lg:text-3xl font-bold mb-1 bg-gradient-to-r from-yellow-300 to-yellow-200 bg-clip-text text-transparent">4.8</div>
              <div className="text-sm text-purple-200 group-hover:text-purple-100 transition-colors duration-300">Average Rating</div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-center p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300 group"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                <Gift className="text-purple-300 mx-auto mb-3 group-hover:text-purple-200 transition-colors duration-300" size={28} />
              </motion.div>
              <div className="text-2xl lg:text-3xl font-bold mb-1 bg-gradient-to-r from-purple-300 to-purple-200 bg-clip-text text-transparent">500+</div>
              <div className="text-sm text-purple-200 group-hover:text-purple-100 transition-colors duration-300">Products</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
