'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Gift, Sparkles, Star, Users } from 'lucide-react';
import Link from 'next/link';

export default function HeroPromo() {
  return (
    <section className="min-h-screen py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0">
        {/* Dynamic gradient orbs */}
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Floating particles with parallax effect */}
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => {
            const positions = [
              { left: '5%', top: '10%' }, { left: '15%', top: '25%' }, { left: '25%', top: '45%' },
              { left: '35%', top: '15%' }, { left: '45%', top: '35%' }, { left: '55%', top: '20%' },
              { left: '65%', top: '40%' }, { left: '75%', top: '10%' }, { left: '85%', top: '30%' },
              { left: '95%', top: '50%' }, { left: '10%', top: '60%' }, { left: '20%', top: '80%' },
              { left: '30%', top: '70%' }, { left: '40%', top: '90%' }, { left: '50%', top: '75%' },
              { left: '60%', top: '85%' }, { left: '70%', top: '65%' }, { left: '80%', top: '95%' },
              { left: '90%', top: '70%' }, { left: '8%', top: '40%' }, { left: '18%', top: '55%' },
              { left: '28%', top: '30%' }, { left: '38%', top: '50%' }, { left: '48%', top: '25%' },
              { left: '58%', top: '45%' }, { left: '68%', top: '35%' }, { left: '78%', top: '55%' },
              { left: '88%', top: '40%' }, { left: '12%', top: '85%' }, { left: '22%', top: '15%' },
              { left: '32%', top: '95%' }, { left: '42%', top: '5%' }, { left: '52%', top: '60%' },
              { left: '62%', top: '10%' }, { left: '72%', top: '80%' }, { left: '82%', top: '20%' },
              { left: '92%', top: '90%' }, { left: '6%', top: '75%' }, { left: '16%', top: '5%' },
              { left: '26%', top: '90%' }, { left: '36%', top: '20%' }, { left: '46%', top: '80%' }
            ];
            const position = positions[i] || { left: '50%', top: '50%' };
            
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                style={position}
                animate={{
                  y: [0, -40, 0],
                  opacity: [0, 1, 0],
                  scale: [0.3, 1.2, 0.3],
                  x: [0, (Math.random() - 0.5) * 20, 0],
                }}
                transition={{
                  duration: 6 + (i % 4) * 2,
                  repeat: Infinity,
                  delay: (i % 6) * 0.5,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 min-h-screen flex items-center">
        <div className="w-full">
          {/* Main Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12 lg:mb-16"
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

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
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

          {/* Floating Fashion Categories */}
          <div className="relative w-full h-96 lg:h-[500px] mb-8">
            {/* Women's Fashion - Top Left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -100, y: -50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="absolute top-0 left-0 lg:left-8 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 group cursor-pointer"
            >
              <div className="w-full h-full bg-gradient-to-br from-pink-500/40 to-rose-500/40 rounded-3xl backdrop-blur-sm border border-white/30 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="relative h-full flex flex-col items-center justify-center p-4">
                  <motion.div
                    animate={{ 
                      y: [0, -8, 0],
                      rotate: [0, 3, -3, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="text-3xl sm:text-4xl lg:text-5xl mb-2"
                  >
                    👗
                  </motion.div>
                  <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg text-center">Women's</h3>
                  <p className="text-pink-200 text-xs sm:text-sm text-center">Elegant</p>
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  NEW
                </motion.div>
              </div>
            </motion.div>

            {/* Men's Fashion - Top Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 100, y: -50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="absolute top-0 right-0 lg:right-8 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 group cursor-pointer"
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-500/40 to-indigo-500/40 rounded-3xl backdrop-blur-sm border border-white/30 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="relative h-full flex flex-col items-center justify-center p-4">
                  <motion.div
                    animate={{ 
                      y: [0, -8, 0],
                      rotate: [0, -3, 3, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="text-3xl sm:text-4xl lg:text-5xl mb-2"
                  >
                    👔
                  </motion.div>
                  <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg text-center">Men's</h3>
                  <p className="text-blue-200 text-xs sm:text-sm text-center">Sharp</p>
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                >
                  HOT
                </motion.div>
              </div>
            </motion.div>

            {/* Boys Fashion - Bottom Left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -100, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="absolute bottom-0 left-0 lg:left-8 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 group cursor-pointer"
            >
              <div className="w-full h-full bg-gradient-to-br from-green-500/40 to-emerald-500/40 rounded-3xl backdrop-blur-sm border border-white/30 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="relative h-full flex flex-col items-center justify-center p-4">
                  <motion.div
                    animate={{ 
                      y: [0, -8, 0],
                      rotate: [0, 4, -4, 0]
                    }}
                    transition={{ 
                      duration: 3.5, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1
                    }}
                    className="text-3xl sm:text-4xl lg:text-5xl mb-2"
                  >
                    👦
                  </motion.div>
                  <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg text-center">Boys</h3>
                  <p className="text-green-200 text-xs sm:text-sm text-center">Cool</p>
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.6
                  }}
                >
                  SALE
                </motion.div>
              </div>
            </motion.div>

            {/* Girls Fashion - Bottom Right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 100, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="absolute bottom-0 right-0 lg:right-8 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 group cursor-pointer"
            >
              <div className="w-full h-full bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-3xl backdrop-blur-sm border border-white/30 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="relative h-full flex flex-col items-center justify-center p-4">
                  <motion.div
                    animate={{ 
                      y: [0, -8, 0],
                      rotate: [0, -4, 4, 0]
                    }}
                    transition={{ 
                      duration: 3.8, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      delay: 1.2
                    }}
                    className="text-3xl sm:text-4xl lg:text-5xl mb-2"
                  >
                    👧
                  </motion.div>
                  <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg text-center">Girls</h3>
                  <p className="text-purple-200 text-xs sm:text-sm text-center">Cute</p>
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.9
                  }}
                >
                  BEST
                </motion.div>
              </div>
            </motion.div>

            {/* Center Floating Elements */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl"
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-pink-300">30%</div>
                <div className="text-xs sm:text-sm text-purple-200">OFF</div>
              </div>
            </motion.div>

            <motion.div
              className="absolute top-1/4 right-1/4 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center shadow-2xl"
              animate={{ 
                y: [0, 10, 0],
                x: [0, 5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }}
            >
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-blue-300">FREE</div>
                <div className="text-xs text-purple-200">Ship</div>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-1/4 left-1/4 w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center shadow-2xl"
              animate={{ 
                y: [0, -10, 0],
                x: [0, -5, 0]
              }}
              transition={{ 
                duration: 3.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-yellow-300">NEW</div>
                <div className="text-xs text-purple-200">Items</div>
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 lg:gap-12"
          >
            <div className="flex items-center gap-3">
              <Users className="text-pink-300" size={20} />
              <div>
                <div className="text-2xl lg:text-3xl font-bold">10K+</div>
                <div className="text-sm text-purple-200">Happy Customers</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Star className="text-yellow-300" size={20} />
              <div>
                <div className="text-2xl lg:text-3xl font-bold">4.8</div>
                <div className="text-sm text-purple-200">Average Rating</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gift className="text-purple-300" size={20} />
              <div>
                <div className="text-2xl lg:text-3xl font-bold">500+</div>
                <div className="text-sm text-purple-200">Products</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
