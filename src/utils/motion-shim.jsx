/**
 * Framer-motion shim - CSS transition based replacements
 * Fixes Vite production build TDZ issues with framer-motion
 */
import React, { forwardRef } from 'react';

const createMotionComponent = (tag) => {
  return forwardRef(({
    children,
    initial,
    animate,
    exit,
    transition,
    whileHover,
    whileTap,
    variants,
    className = '',
    style = {},
    ...props
  }, ref) => {
    const Tag = tag;
    return (
      <Tag
        ref={ref}
        className={`transition-all duration-300 ${className}`}
        style={style}
        {...props}
      >
        {children}
      </Tag>
    );
  });
};

export const motion = {
  div: createMotionComponent('div'),
  span: createMotionComponent('span'),
  button: createMotionComponent('button'),
  a: createMotionComponent('a'),
  ul: createMotionComponent('ul'),
  li: createMotionComponent('li'),
  p: createMotionComponent('p'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  section: createMotionComponent('section'),
  article: createMotionComponent('article'),
  nav: createMotionComponent('nav'),
  aside: createMotionComponent('aside'),
  img: createMotionComponent('img'),
};

export const AnimatePresence = ({ children }) => <>{children}</>;

export default motion;
