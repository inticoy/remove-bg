/**
 * Footer component with credits and privacy notice
 */

import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card mx-4 mb-4 px-6 py-4"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/80 text-sm">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="text-xs">
            100% Private - All processing happens in your browser
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span>Powered by MediaPipe</span>
          <span>•</span>
          <a
            href="https://github.com/google/mediapipe"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Apache-2.0 License
          </a>
          <span>•</span>
          <span>© 2025</span>
        </div>
      </div>
    </motion.footer>
  );
};
