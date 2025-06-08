import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
                kazipo
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Smart attendance tracking with geofencing technology.
              Simplify your attendance management with our secure location-based solution.
            </p>
            <div className="mt-4 flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Github</span>
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Email</span>
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/attendance" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Attendance
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-base text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} kazipo. All rights reserved.
          </p>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
            Made with ♥ for modern workplaces
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;