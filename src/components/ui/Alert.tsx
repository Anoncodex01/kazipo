import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

type AlertVariant = 'success' | 'info' | 'warning' | 'error';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  isVisible?: boolean;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  isVisible = true,
  onClose,
  className = ''
}) => {
  const variantStyles = {
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
  };
  
  const iconColor = {
    success: 'text-green-500 dark:text-green-400',
    info: 'text-blue-500 dark:text-blue-400',
    warning: 'text-yellow-500 dark:text-yellow-400',
    error: 'text-red-500 dark:text-red-400'
  };
  
  const IconComponent = {
    success: CheckCircle,
    info: Info,
    warning: AlertTriangle,
    error: XCircle
  }[variant];
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`rounded-md border p-4 ${variantStyles[variant]} ${className}`}
          role="alert"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <IconComponent className={`h-5 w-5 ${iconColor[variant]}`} />
            </div>
            <div className="ml-3 flex-1">
              {title && (
                <h3 className="text-sm font-medium">{title}</h3>
              )}
              <div className="text-sm mt-1">{message}</div>
            </div>
            {onClose && (
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-transparent text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={onClose}
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;