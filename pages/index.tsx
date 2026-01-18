// Farmanesia Landing Page with Burger Menu - Inspired by Harizma Template
import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

// Import custom components
import BurgerMenu from '../components/landing/BurgerMenu';
import Hero from '../components/landing/Hero';
import Services from '../components/landing/Services';

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Remove auto-redirect to allow users to see homepage with proper buttons
  // Users can manually click "Buka Dashboard" to access their dashboard

  // Handle logout success message
  useEffect(() => {
    if (router.query.logout === 'success') {
      toast.success('Anda berhasil logout', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: 'white',
          fontWeight: '500',
          fontSize: '14px',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
        },
        icon: '✓',
      });
      
      // Clean up URL parameter
      router.replace('/', undefined, { shallow: true });
    }
  }, [router.query.logout, router]);

  // Simulate loading effect for smoother animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>FARMANESIA - Sistem Manajemen Apotek Terpadu</title>
        <meta name="description" content="FARMANESIA - Sistem Manajemen Apotek Terpadu yang efisien" />
      </Head>

      {/* Loading screen with animation */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="fixed inset-0 bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center z-50"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-white text-4xl font-bold"
            >
              FARMANESIA
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="min-h-screen w-full flex flex-col overflow-hidden">
        {/* Burger Menu */}
        <BurgerMenu />
        
        {/* Hero Section with Full-height */}
        <Hero />
        
        {/* Services Section */}
        <Services />
      </div>
    </>
  );
};

export default Home;