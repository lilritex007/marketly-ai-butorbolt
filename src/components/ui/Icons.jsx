import React from 'react';
import { 
  LayoutGrid, Sofa, Armchair, BedDouble, Lamp, LampDesk, Package, 
  Table, BookOpen, Tv, Bath, UtensilsCrossed, Briefcase, Baby,
  Flower2, TreeDeciduous, Warehouse, Shirt, Home, Box,
  MessageCircle, Camera, Move3d, Sparkles, Lightbulb, Zap,
  Palette, DollarSign, Crown, Target, Handshake, Recycle,
  ThumbsUp, Heart, Shield, Award, Clock, Truck, CheckCircle2,
  Star, TrendingUp, Gift, Search, ArrowRight, Bot
} from 'lucide-react';

/**
 * Category Icon Mapping - consistent furniture-related icons
 */
const CATEGORY_ICONS = {
  // Default & General
  'Összes': LayoutGrid,
  'default': Package,
  
  // Living Room
  'Kanapé': Sofa,
  'Kanapék': Sofa,
  'Fotel': Armchair,
  'Fotelek': Armchair,
  'Ülőgarnitúra': Sofa,
  'Ülőgarnitúrák': Sofa,
  'Nappali': Tv,
  'Nappali bútor': Tv,
  
  // Bedroom
  'Ágy': BedDouble,
  'Ágyak': BedDouble,
  'Hálószoba': BedDouble,
  'Hálószoba bútor': BedDouble,
  'Matrac': BedDouble,
  'Matracok': BedDouble,
  
  // Seating
  'Szék': Armchair,
  'Székek': Armchair,
  'Irodai szék': Briefcase,
  'Irodaszék': Briefcase,
  
  // Tables
  'Asztal': Table,
  'Asztalok': Table,
  'Étkezőasztal': UtensilsCrossed,
  'Dohányzóasztal': Table,
  'Íróasztal': Briefcase,
  
  // Storage
  'Szekrény': Warehouse,
  'Szekrények': Warehouse,
  'Gardrób': Shirt,
  'Gardróbszekrény': Shirt,
  'Komód': Box,
  'Polc': BookOpen,
  'Polcok': BookOpen,
  'Könyvespolc': BookOpen,
  'Tárolás': Package,
  
  // Lighting
  'Lámpa': Lamp,
  'Lámpák': Lamp,
  'Világítás': LampDesk,
  'Asztali lámpa': LampDesk,
  'Állólámpa': Lamp,
  
  // Office
  'Iroda': Briefcase,
  'Iroda bútor': Briefcase,
  'Dolgozószoba': Briefcase,
  
  // Kids & Baby
  'Gyerek': Baby,
  'Gyerekszoba': Baby,
  'Baba': Baby,
  
  // Bathroom
  'Fürdőszoba': Bath,
  'Fürdő': Bath,
  
  // Outdoor & Garden
  'Kert': TreeDeciduous,
  'Kerti': TreeDeciduous,
  'Kerti bútor': TreeDeciduous,
  'Terasz': Flower2,
  
  // Home & Decor
  'Dekoráció': Flower2,
  'Lakástextil': Home,
  'Kiegészítő': Gift,
};

/**
 * Get icon component for a category name
 */
export const getCategoryIcon = (categoryName) => {
  if (!categoryName) return Package;
  
  // Direct match
  if (CATEGORY_ICONS[categoryName]) {
    return CATEGORY_ICONS[categoryName];
  }
  
  // Partial match (case insensitive)
  const lowerName = categoryName.toLowerCase();
  for (const [key, Icon] of Object.entries(CATEGORY_ICONS)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return Icon;
    }
  }
  
  return Package;
};

/**
 * Renders a category icon with consistent styling
 */
export const CategoryIcon = ({ name, className = "w-4 h-4", ...props }) => {
  const Icon = getCategoryIcon(name);
  return <Icon className={className} {...props} />;
};

/**
 * AI Feature Icons
 */
export const AIIcons = {
  Chat: MessageCircle,
  Camera: Camera,
  RoomPlanner: Move3d,
  Sparkles: Sparkles,
  Tip: Lightbulb,
  Quick: Zap,
  Bot: Bot,
};

/**
 * Style Quiz Icons - modern alternatives to emojis
 */
export const StyleIcons = {
  // Styles
  modern: Sparkles,
  scandinavian: TreeDeciduous,
  industrial: Warehouse,
  vintage: Clock,
  bohemian: Palette,
  
  // Colors
  neutral: () => <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-400" />,
  earth: () => <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-600 to-green-700" />,
  bold: () => <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-red-500" />,
  pastel: () => <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-300 to-purple-300" />,
  
  // Budget
  budget: DollarSign,
  mid: Award,
  premium: Crown,
  flexible: Target,
  
  // Priorities
  comfort: Sofa,
  design: Palette,
  durability: Shield,
  versatility: Recycle,
  eco: TreeDeciduous,
  
  // Rooms
  living: Tv,
  bedroom: BedDouble,
  dining: UtensilsCrossed,
  office: Briefcase,
  all: Home,
};

/**
 * Trust/Feature Icons
 */
export const TrustIcons = {
  quality: Shield,
  delivery: Truck,
  support: MessageCircle,
  warranty: Award,
  returns: Recycle,
  secure: CheckCircle2,
};

/**
 * Animated Icon Wrapper
 */
export const AnimatedIcon = ({ icon: Icon, className = "", pulse = false, bounce = false, spin = false }) => {
  const animationClass = pulse ? 'animate-pulse' : bounce ? 'animate-bounce' : spin ? 'animate-spin' : '';
  return <Icon className={`${className} ${animationClass}`} />;
};

/**
 * Icon with gradient background
 */
export const GradientIcon = ({ 
  icon: Icon, 
  gradient = "from-indigo-500 to-purple-600",
  size = "md",
  className = ""
}) => {
  const sizes = {
    sm: "w-8 h-8 p-1.5",
    md: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-2.5",
    xl: "w-14 h-14 p-3"
  };
  
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-7 h-7"
  };
  
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center ${sizes[size]} ${className}`}>
      <Icon className={`${iconSizes[size]} text-white`} />
    </div>
  );
};

/**
 * Demo Flow - replaces emoji flows with icons
 */
export const DemoFlow = ({ steps, size = "md" }) => {
  const iconSize = size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6";
  const arrowSize = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
  
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, idx) => (
        <React.Fragment key={idx}>
          <div className={`${step.bg || 'bg-gray-100'} rounded-lg p-2`}>
            <step.icon className={`${iconSize} ${step.color || 'text-gray-600'}`} />
          </div>
          {idx < steps.length - 1 && (
            <ArrowRight className={`${arrowSize} text-gray-300`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default {
  getCategoryIcon,
  CategoryIcon,
  AIIcons,
  StyleIcons,
  TrustIcons,
  AnimatedIcon,
  GradientIcon,
  DemoFlow
};
