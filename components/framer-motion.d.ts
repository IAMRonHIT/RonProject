// Type definitions for framer-motion extensions
import { ComponentType } from 'react';
import { HTMLMotionProps } from 'framer-motion';

// Extend the motion namespace to include HTML props
declare module 'framer-motion' {
  // Add proper types for motion components
  interface Motion {
    div: ComponentType<HTMLMotionProps<'div'>>;
    button: ComponentType<HTMLMotionProps<'button'>>;
    span: ComponentType<HTMLMotionProps<'span'>>;
    p: ComponentType<HTMLMotionProps<'p'>>;
    h1: ComponentType<HTMLMotionProps<'h1'>>;
    h2: ComponentType<HTMLMotionProps<'h2'>>;
    h3: ComponentType<HTMLMotionProps<'h3'>>;
    h4: ComponentType<HTMLMotionProps<'h4'>>;
    h5: ComponentType<HTMLMotionProps<'h5'>>;
    h6: ComponentType<HTMLMotionProps<'h6'>>;
    ul: ComponentType<HTMLMotionProps<'ul'>>;
    ol: ComponentType<HTMLMotionProps<'ol'>>;
    li: ComponentType<HTMLMotionProps<'li'>>;
    a: ComponentType<HTMLMotionProps<'a'>>;
    img: ComponentType<HTMLMotionProps<'img'>>;
    svg: ComponentType<HTMLMotionProps<'svg'>>;
    path: ComponentType<HTMLMotionProps<'path'>>;
    rect: ComponentType<HTMLMotionProps<'rect'>>;
    circle: ComponentType<HTMLMotionProps<'circle'>>;
    line: ComponentType<HTMLMotionProps<'line'>>;
    polygon: ComponentType<HTMLMotionProps<'polygon'>>;
  }
}
