import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useScrollLock } from '../../hooks/useScrollLock';

/**
 * BottomSheet - iOS-style bottom sheet modal
 * Supports drag to close, snap points, and swipe gestures
 */
const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.5, 0.9], // Percentage of screen height
  initialSnap = 0,
  showHandle = true,
  showClose = true
}) => {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const sheetRef = useRef(null);
  const contentRef = useRef(null);
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setCurrentSnap(initialSnap);
      setDragOffset(0);
    }
  }, [isOpen, initialSnap]);

  const getSheetHeight = () => {
    const snapHeight = snapPoints[currentSnap] * 100;
    return `${snapHeight}vh`;
  };

  const handleTouchStart = (e) => {
    // Only allow drag from handle area
    if (e.target.closest('.sheet-content') && contentRef.current?.scrollTop > 0) {
      return;
    }
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;
    
    // Only allow dragging down
    if (diff > 0) {
      setDragOffset(diff);
    } else {
      // Allow dragging up to expand
      setDragOffset(diff * 0.3); // Resistance when dragging up
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    
    if (dragOffset > threshold) {
      // Dragged down enough - close or snap to lower point
      if (currentSnap === 0) {
        onClose();
      } else {
        setCurrentSnap(currentSnap - 1);
      }
    } else if (dragOffset < -threshold && currentSnap < snapPoints.length - 1) {
      // Dragged up - snap to higher point
      setCurrentSnap(currentSnap + 1);
    }
    
    setDragOffset(0);
  };

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] md:hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isDragging ? 'opacity-40' : 'opacity-50'}`}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out"
        style={{
          height: getSheetHeight(),
          transform: `translateY(${Math.max(0, dragOffset)}px)`,
          transitionProperty: isDragging ? 'none' : 'all'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {showClose && (
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="sheet-content flex-1 overflow-y-auto overscroll-contain"
          style={{ maxHeight: `calc(${getSheetHeight()} - 100px)` }}
        >
          {children}
        </div>

        {/* Safe area padding for iOS */}
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }} />
      </div>
    </div>
  );
};

/**
 * FilterBottomSheet - Pre-styled filter sheet
 */
export const FilterBottomSheet = ({
  isOpen,
  onClose,
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
  onApply
}) => {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Szűrők" snapPoints={[0.7, 0.9]}>
      <div className="p-5 space-y-6">
        {/* Active filters count */}
        {Object.keys(activeFilters).length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {Object.keys(activeFilters).length} szűrő aktív
            </span>
            <button
              onClick={onClearAll}
              className="text-sm text-primary-500 font-medium"
            >
              Összes törlése
            </button>
          </div>
        )}

        {/* Filter sections */}
        {filters.map((filter) => (
          <FilterSection
            key={filter.id}
            filter={filter}
            value={activeFilters[filter.id]}
            onChange={(value) => onFilterChange(filter.id, value)}
          />
        ))}

        {/* Apply button */}
        <button
          onClick={onApply}
          className="w-full py-4 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors"
        >
          Szűrők alkalmazása
        </button>
      </div>
    </BottomSheet>
  );
};

const FilterSection = ({ filter, value, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border-b border-gray-100 pb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2"
      >
        <span className="font-medium text-gray-900">{filter.label}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="mt-3 space-y-2">
          {filter.type === 'checkbox' && filter.options?.map((option) => (
            <label key={option.value} className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                checked={value?.includes(option.value)}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...(value || []), option.value]
                    : (value || []).filter(v => v !== option.value);
                  onChange(newValue);
                }}
                className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-gray-700">{option.label}</span>
              {option.count && (
                <span className="text-gray-400 text-sm ml-auto">({option.count})</span>
              )}
            </label>
          ))}
          
          {filter.type === 'range' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Min</label>
                  <input
                    type="number"
                    value={value?.min || ''}
                    onChange={(e) => onChange({ ...value, min: e.target.value })}
                    placeholder={filter.min?.toString()}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-200 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Max</label>
                  <input
                    type="number"
                    value={value?.max || ''}
                    onChange={(e) => onChange({ ...value, max: e.target.value })}
                    placeholder={filter.max?.toString()}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-200 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BottomSheet;
