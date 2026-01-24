import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Heart, MessageCircle, Share2, Compass, Users, Sparkles, Camera, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Camera className="h-6 w-6 text-rose-500" />,
    title: "Share Your Story",
    description: "Post photos and updates. Show your style, properties, or lifestyle with beautiful images."
  },
  {
    icon: <Heart className="h-6 w-6 text-rose-500" />,
    title: "Connect & Engage",
    description: "Like, comment, and connect with landlords, agents, and renters in your community."
  },
  {
    icon: <Compass className="h-6 w-6 text-rose-500" />,
    title: "Discover Amazing",
    description: "Explore trending posts from agents and customers. Find inspiration and opportunities."
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-rose-500" />,
    title: "Direct Messages",
    description: "Chat directly with landlords and tenants. Quick, easy, and secure communication."
  }
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with Logo */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Camera className="h-8 w-8 text-black mr-3" />
            <span className="text-2xl font-light tracking-widest text-black">Homely</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => navigate('/register')}>
              Sign up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Instagram Style */}
      <section className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left side - Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-black mb-4 leading-tight">
                Capture Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">Space</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Share amazing properties, connect with your community, and find your perfect home or next tenant.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-8"
                  onClick={() => navigate('/register')}
                >
                  Create Account
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="py-3 px-8 border-2 border-gray-300 hover:border-gray-400"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>

              <p className="text-gray-500 text-sm mt-6">
                Join thousands of agents, landlords, and renters sharing their stories.
              </p>
            </motion.div>

            {/* Right side - Illustration/Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative h-96 md:h-full hidden md:flex items-center justify-center"
            >
              <div className="w-full aspect-square max-w-sm">
                <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-rose-100 via-pink-50 to-blue-100 overflow-hidden shadow-2xl">
                  {/* Instagram-like phone mockup */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-rose-500 mx-auto mb-4" />
                      <p className="text-xl font-semibold text-gray-800">Your Stories</p>
                      <p className="text-gray-600 mt-2">Share moments that matter</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Homely?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed to make property management and finding your next home simple and efficient.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="h-full hover:shadow-lg transition-shadow bg-card border border-border rounded-lg p-6">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Ready to Get Started?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of happy users who found their perfect home or tenant through Homely.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/register')}>
              Create Free Account
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/property-search')}>
              Browse Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-primary mr-2" />
                <span className="text-xl font-bold">Homely</span>
              </div>
              <p className="text-muted-foreground mt-2">Making property management simple.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-4">For Tenants</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link to="/property-search" className="hover:underline">Find a Home</Link></li>
                  <li><Link to="/register" className="hover:underline">Create Account</Link></li>
                  <li><Link to="/login/tenant" className="hover:underline">Tenant Login</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">For Landlords</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link to="/login/landlord" className="hover:underline">Landlord Login</Link></li>
                  <li><Link to="/register" className="hover:underline">List Property</Link></li>
                  <li><Link to="/help" className="hover:underline">Help Center</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link to="/about" className="hover:underline">About Us</Link></li>
                  <li><Link to="/contact" className="hover:underline">Contact</Link></li>
                  <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Homely. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
