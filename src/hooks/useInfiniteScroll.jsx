import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useInfiniteScroll - Custom hook for infinite scrolling
 * Loads more items when user scrolls near the bottom
 * 
 * @param {Array} allItems - Complete array of items
 * @param {number} itemsPerPage - Number of items to load per batch
 * @returns {Object} - { visibleItems, loadMore, hasMore, isLoading, reset }
 */
export const useInfiniteScroll = (allItems, itemsPerPage = 20) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Load initial batch
  useEffect(() => {
    if (allItems.length > 0) {
      const initial = allItems.slice(0, itemsPerPage);
      setVisibleItems(initial);
      setPage(1);
      setHasMore(allItems.length > itemsPerPage);
    }
  }, [allItems, itemsPerPage]);

  // Load more items
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate network delay for smooth UX
    setTimeout(() => {
      const startIndex = page * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newItems = allItems.slice(startIndex, endIndex);

      if (newItems.length > 0) {
        setVisibleItems(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
        setHasMore(endIndex < allItems.length);
      } else {
        setHasMore(false);
      }

      setIsLoading(false);
    }, 300);
  }, [allItems, page, itemsPerPage, isLoading, hasMore]);

  // Intersection Observer for automatic loading
  useEffect(() => {
    if (!sentinelRef.current) return;

    const options = {
      root: null,
      rootMargin: '200px', // Start loading 200px before reaching bottom
      threshold: 0.1
    };

    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !isLoading) {
        loadMore();
      }
    }, options);

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, loadMore]);

  // Reset function (useful when filters change)
  const reset = useCallback(() => {
    setPage(1);
    setVisibleItems(allItems.slice(0, itemsPerPage));
    setHasMore(allItems.length > itemsPerPage);
  }, [allItems, itemsPerPage]);

  return {
    visibleItems,
    loadMore,
    hasMore,
    isLoading,
    reset,
    sentinelRef // Attach this ref to a sentinel element at the bottom of your list
  };
};

/**
 * InfiniteScrollSentinel - Component to mark the bottom of the list
 * Attach the sentinelRef from useInfiniteScroll to this component
 */
export const InfiniteScrollSentinel = ({ sentinelRef, isLoading, hasMore }) => {
  return (
    <div ref={sentinelRef} className="py-8 flex justify-center">
      {isLoading && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Betöltés...</span>
        </div>
      )}
      {!isLoading && !hasMore && (
        <div className="text-sm text-gray-400">
          ✓ Minden termék betöltve
        </div>
      )}
    </div>
  );
};
