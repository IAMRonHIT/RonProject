/**
 * This is a type declaration file for Framer Motion
 * It extends the built-in types to properly support HTML attributes on motion components
 */

import 'framer-motion';

declare module 'framer-motion' {
  // Extend the motion namespace to include common HTML attributes
  export interface MotionProps {
    className?: string;
    onClick?: React.MouseEventHandler;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }
}
