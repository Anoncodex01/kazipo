import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, Shield, CheckCircle, BarChart } from 'lucide-react';
import Button from '../components/ui/Button';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-blue-500" />,
      title: 'Geofenced Attendance',
      description: 'Check in and out only when you\'re physically present at your workplace.'
    },
    {
      icon: <Clock className="h-8 w-8 text-teal-500" />,
      title: 'Real-time Tracking',
      description: 'Monitor employee attendance in real-time with accurate timestamps.'
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      title: 'Secure & Reliable',
      description: 'Your attendance data is securely stored and always accessible when needed.'
    },
    {
      icon: <BarChart className="h-8 w-8 text-orange-500" />,
      title: 'Comprehensive Reports',
      description: 'Generate detailed attendance reports and analyze patterns.'
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: 'Employee Management',
      description: 'Easily manage employees, departments, and attendance policies.'
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-red-500" />,
      title: 'Automatic Compliance',
      description: 'Ensure compliance with work hours and attendance policies.'
    }
  ];
  
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40">
            <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
              >
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Modern attendance </span>
                  <span className="block text-blue-600 dark:text-blue-400 xl:inline">
                    tracking simplified
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  kazipo revolutionizes attendance management with location-based check-ins.
                  Eliminate buddy punching, simplify administration, and gain accurate insights 
                  into attendance patterns.
                </p>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="sm:w-auto"
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/login')}
                      className="sm:w-auto"
                    >
                      Log In
                    </Button>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
              >
                <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                  <div className="relative block w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      className="w-full"
                      src="https://images.pexels.com/photos/3183165/pexels-photo-3183165.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
                      alt="People working in an office"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 rounded-lg p-4 shadow-md">
                        <div className="flex items-center space-x-4">
                          <div className="rounded-full h-10 w-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/20">
                            <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800 dark:text-white">Check-in successful</span>
                            <span className="text-xs text-gray-500 dark:text-gray-300">9:02 AM • 100m from office</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Everything you need for attendance management
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 mx-auto">
              Designed for modern workplaces with powerful features to streamline attendance tracking.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="h-12 w-12 rounded-md flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-blue-600 dark:bg-blue-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-blue-200">Start using kazipo today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button
                variant="ghost"
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                onClick={() => navigate('/register')}
              >
                Get started
              </Button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Button
                variant="ghost"
                size="lg"
                className="bg-blue-500 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                onClick={() => navigate('/login')}
              >
                Log in
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;