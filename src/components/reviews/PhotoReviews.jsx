import React, { useState } from 'react';
import { Star, Camera, ThumbsUp, Check, ChevronLeft, ChevronRight, X, Sparkles, Quote, Filter, Image } from 'lucide-react';

/**
 * PhotoReviews - Customer reviews 2.0 with photos
 * Features: Photo gallery, verified purchases, AI summary, helpfulness votes
 */
const PhotoReviews = ({ productId, reviews = [] }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'with-photos' | '5-star' | '4-star'
  const [expandedReview, setExpandedReview] = useState(null);

  // Mock reviews with photos if not provided
  const mockReviews = reviews.length ? reviews : [
    {
      id: 1,
      author: 'Kovács Anna',
      avatar: null,
      rating: 5,
      date: '2025-01-15',
      verified: true,
      title: 'Tökéletes minőség!',
      content: 'Nagyon elégedett vagyok a vásárlással. A bútor pontosan olyan, mint a képeken, sőt élőben még szebb! A szállítás gyors volt és a szerelés is egyszerű.',
      photos: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400'
      ],
      helpful: 24,
      isHelpful: false
    },
    {
      id: 2,
      author: 'Nagy Péter',
      avatar: null,
      rating: 4,
      date: '2025-01-10',
      verified: true,
      title: 'Jó ár-érték arány',
      content: 'A termék megfelel a leírásnak. Kisebb eltérés a színben, de összességében elégedett vagyok.',
      photos: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400'],
      helpful: 12,
      isHelpful: false
    },
    {
      id: 3,
      author: 'Szabó Eszter',
      avatar: null,
      rating: 5,
      date: '2025-01-05',
      verified: true,
      title: 'Gyönyörű darab!',
      content: 'Régóta kerestem ilyen bútort. Tökéletesen passzol a nappaliba. A család is imádja!',
      photos: [],
      helpful: 8,
      isHelpful: true
    }
  ];

  // AI Summary of reviews
  const aiSummary = {
    positive: ['Kiváló minőség', 'Gyors szállítás', 'Könnyű szerelés', 'Szép design'],
    negative: ['Enyhe színeltérés'],
    overall: 'A vásárlók 95%-a ajánlja'
  };

  // Calculate stats
  const avgRating = mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;
  const photoCount = mockReviews.reduce((sum, r) => sum + (r.photos?.length || 0), 0);
  const verifiedCount = mockReviews.filter(r => r.verified).length;

  // Filter reviews
  const filteredReviews = mockReviews.filter(review => {
    if (filter === 'with-photos') return review.photos?.length > 0;
    if (filter === '5-star') return review.rating === 5;
    if (filter === '4-star') return review.rating === 4;
    return true;
  });

  // All photos from all reviews
  const allPhotos = mockReviews.flatMap(r => r.photos?.map(p => ({ url: p, review: r })) || []);

  const renderStars = (rating, size = 'w-4 h-4') => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star} 
          className={`${size} ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
        />
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header with Stats */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-1">Vásárlói vélemények</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                {renderStars(Math.round(avgRating))}
                <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({mockReviews.length} vélemény)</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Camera className="w-4 h-4" />
                {photoCount} fotó
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                {verifiedCount} ellenőrzött
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 sm:p-5 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
              AI összegzés
              <span className="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-bold rounded">BETA</span>
            </h4>
            <p className="text-sm text-gray-700 mb-2">{aiSummary.overall}</p>
            <div className="flex flex-wrap gap-2">
              {aiSummary.positive.map((item, idx) => (
                <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  ✓ {item}
                </span>
              ))}
              {aiSummary.negative.map((item, idx) => (
                <span key={idx} className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                  △ {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Strip */}
      {allPhotos.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Image className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Vásárlói fotók</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {allPhotos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPhoto(photo)}
                className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
              >
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        {[
          { id: 'all', label: 'Mind' },
          { id: 'with-photos', label: 'Fotóval' },
          { id: '5-star', label: '5 csillag' },
          { id: '4-star', label: '4 csillag' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
              filter === f.id 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-100">
        {filteredReviews.map(review => (
          <div key={review.id} className="p-4 sm:p-5">
            {/* Review Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{review.author}</span>
                    {review.verified && (
                      <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
                        <Check className="w-3 h-3" />
                        Ellenőrzött
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {renderStars(review.rating, 'w-3.5 h-3.5')}
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="mb-3">
              <h4 className="font-bold text-gray-900 text-sm mb-1">{review.title}</h4>
              <p className={`text-sm text-gray-600 ${expandedReview === review.id ? '' : 'line-clamp-3'}`}>
                {review.content}
              </p>
              {review.content.length > 150 && expandedReview !== review.id && (
                <button 
                  onClick={() => setExpandedReview(review.id)}
                  className="text-primary-600 text-sm font-medium hover:underline mt-1"
                >
                  Tovább olvasom
                </button>
              )}
            </div>

            {/* Review Photos */}
            {review.photos?.length > 0 && (
              <div className="flex gap-2 mb-3">
                {review.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhoto({ url: photo, review })}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Helpful Button */}
            <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              review.isHelpful 
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
              <ThumbsUp className="w-3.5 h-3.5" />
              Hasznos ({review.helpful})
            </button>
          </div>
        ))}
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 lg:top-[60px] bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <img 
            src={selectedPhoto.url} 
            alt="" 
            className="max-w-full max-h-[80vh] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          
          {selectedPhoto.review && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white max-w-lg mx-auto">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{selectedPhoto.review.author}</span>
                {renderStars(selectedPhoto.review.rating, 'w-3.5 h-3.5')}
              </div>
              <p className="text-sm text-white/80 line-clamp-2">{selectedPhoto.review.content}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoReviews;
