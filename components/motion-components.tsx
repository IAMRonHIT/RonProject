/**
 * This file provides properly typed Framer Motion components to avoid TypeScript errors
 * when using motion components with props like className, onClick, etc.
 */
import { motion } from 'framer-motion';

// Export the standard motion object for backward compatibility
export { motion };

// Export motion as the default as well to maintain drop-in replacement capability
export default motion;
