import { Bus, MapPin, Clock, Shield, CreditCard, Star, ArrowRight, CheckCircle, Sparkles, Award } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../Footer/Footer';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onOperatorLogin: () => void;
}

export function LandingPage({ onSignIn, onSignUp, onOperatorLogin }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: MapPin,
      title: 'Smart Route Planning',
      description: 'Smart route suggestions to find the fastest and most comfortable journey',
      color: '#264b8d'
    },
    {
      icon: Clock,
      title: 'Real-Time Tracking',
      description: 'Live updates on seat availability, departure times, and bus location',
      color: '#7c90a6'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Bank-grade encryption for payments and verified operator partnerships',
      color: '#dfae6b'
    },
    {
      icon: Bus,
      title: 'Interactive Seat Selection',
      description: 'Visual bus layout to choose your perfect seat with real-time availability',
      color: '#264b8d'
    },
    {
      icon: CreditCard,
      title: 'Flexible Payments',
      description: 'Multiple payment options including cards, wallets, and net banking',
      color: '#7c90a6'
    },
    {
      icon: Star,
      title: 'Best Price Guarantee',
      description: 'Competitive pricing with exclusive deals and loyalty rewards',
      color: '#dfae6b'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Happy Travelers', color: '#dfae6b' },
    { value: '200+', label: 'Routes Covered', color: '#7c90a6' },
    { value: '98%', label: 'Satisfaction Rate', color: '#264b8d' },
    { value: '24/7', label: 'Support Available', color: '#dfae6b' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="bg-[#264b8d] p-2.5 rounded-xl group-hover:shadow-lg transition-shadow">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#264b8d]">
                QuickSeat
              </span>
            </div>

            <div className="flex items-center gap-8">
              <a href="#about" className="hidden md:inline text-slate-700 hover:text-[#264b8d] font-medium transition-colors">
                About Us
              </a>
              <a href="#contact" className="hidden md:inline text-slate-700 hover:text-[#264b8d] font-medium transition-colors">
                Contact
              </a>
              <Link
                to="/signin"
                className="px-5 py-2.5 text-slate-700 hover:text-[#264b8d] font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 bg-[#264b8d] text-white rounded-xl font-medium hover:bg-[#1e3a6d] hover:shadow-lg transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden h-[800px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1736914329433-4ad65d2371f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXMlMjB0cmF2ZWwlMjBoaWdod2F5JTIwc2NlbmljfGVufDF8fHx8MTc2ODY1NjYxM3ww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Bus travel scenic"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-slate-900/40"></div>
        </div>

        {/* Content - Centered */}
        <div className="relative h-full w-full px-4 sm:px-6 lg:px-12 xl:px-20 2xl:px-32">
          <div className="flex items-center justify-center h-full">
            <div className="max-w-5xl text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                <Sparkles className="w-5 h-5 text-[#dfae6b]" />
                <span className="text-base font-medium text-white">Trusted by 50,000+ travelers across Sri Lanka</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight">
                Book Your
                <span className="block text-[#dfae6b] mt-2">
                  Perfect Journey
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl text-white/90 leading-relaxed max-w-4xl mx-auto">
                Experience seamless bus travel with real-time bookings, smart seat selection, and instant e-tickets.
              </p>
              
              <div className="flex flex-wrap gap-6 pt-4 justify-center">
                <button
                  onClick={onSignUp}
                  className="group px-10 py-5 bg-[#264b8d] text-white rounded-xl font-semibold text-xl hover:bg-[#1e3a6d] hover:shadow-xl transition-all duration-300 flex items-center gap-3"
                >
                  Start Booking Now
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onSignIn}
                  className="px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold text-xl hover:bg-white/20 transition-all duration-300"
                >
                  Explore Features
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-[#dfae6b]" />
                  <span className="text-lg text-white/90">Instant Confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-[#dfae6b]" />
                  <span className="text-lg text-white/90">Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-[#dfae6b]" />
                  <span className="text-lg text-white/90">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#264b8d] py-20">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 2xl:px-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3">{stat.value}</div>
                <div className="text-lg md:text-xl text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-28 bg-slate-50">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 2xl:px-32">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#dfae6b]/10 border border-[#dfae6b]/20 rounded-full mb-8">
              <Award className="w-5 h-5 text-[#dfae6b]" />
              <span className="text-base font-medium text-[#dfae6b]">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Everything You Need for a
              <span className="block text-[#264b8d] mt-2">
                Perfect Journey
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto">
              Experience the most advanced bus booking platform with cutting-edge features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="group relative bg-white p-8 rounded-2xl border-2 border-slate-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  style={{
                    boxShadow: hoveredFeature === index ? `0 20px 60px -15px ${feature.color}40` : undefined
                  }}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-all duration-300"
                    style={{ backgroundColor: feature.color }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div 
                    className="mt-4 flex items-center gap-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: feature.color }}
                  >
                    Learn more
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-28 bg-[#264b8d]">
        <div className="w-full max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-12 xl:px-20 2xl:px-32">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Join thousands of happy travelers and experience hassle-free bus booking today
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/signup"
              className="group px-10 py-5 bg-white text-[#264b8d] rounded-xl font-bold text-lg hover:bg-slate-50 transition-all duration-300 hover:shadow-2xl flex items-center gap-2"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/signin"
              className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/90">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Instant booking confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
