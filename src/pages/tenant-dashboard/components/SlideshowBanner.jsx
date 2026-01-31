import React, { useState, useEffect, useRef } from 'react';

// Static promotional slides for the banner
const defaultSlides = [
  {
    id: 1,
    title: 'Find your dream home',
    subtitle: 'Search thousands of verified listings near you',
    image: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1600&h=600&fit=crop'
  },
  {
    id: 2,
    title: 'Trusted landlords',
    subtitle: 'Verified listings with transparent pricing',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1600&h=600&fit=crop'
  },
  {
    id: 3,
    title: 'Schedule a viewing',
    subtitle: 'Connect directly with property owners and book viewings',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1600&h=600&fit=crop'
  }
];

const SlideshowBanner = ({ slides = defaultSlides, interval = 2000 }) => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const startTimer = () => {
    stopTimer();
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, interval);
  };

  const stopTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const goTo = (i) => {
    stopTimer();
    setIndex(i);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md">
      <div className="relative h-56 md:h-72 lg:h-80 bg-black/5">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            style={{ backgroundImage: `url(${s.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            aria-hidden={i !== index}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">{s.title}</h2>
              <p className="mt-1 text-sm md:text-base">{s.subtitle}</p>
              <div className="mt-4">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md mr-2">Explore</button>
                <button className="px-4 py-2 bg-white/20 text-white rounded-md">Contact Owner</button>
              </div>
            </div>
          </div>
        ))}

        {/* Controls */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:block">
          <button onClick={() => goTo((index - 1 + slides.length) % slides.length)} className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60">‹</button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
          <button onClick={() => goTo((index + 1) % slides.length)} className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60">›</button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => goTo(i)} className={`w-3 h-3 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`} aria-label={`Go to slide ${i+1}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlideshowBanner;
