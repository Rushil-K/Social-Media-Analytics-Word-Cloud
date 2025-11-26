import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import { WordFrequency, Sentiment } from '../types';
import { SENTIMENT_COLORS } from '../constants';

interface SentimentBubbleCloudProps {
  data: WordFrequency[];
  sentiment: Sentiment;
}

const SentimentBubbleCloud: React.FC<SentimentBubbleCloudProps> = ({ data, sentiment }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredWord, setHoveredWord] = useState<WordFrequency | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Interactive Controls State
  const [wordLimit, setWordLimit] = useState(25); // Default limit for card view
  const [filterText, setFilterText] = useState('');
  const [showControls, setShowControls] = useState(false);

  // Sync word limit when entering/exiting fullscreen
  useEffect(() => {
    if (isFullScreen) {
        setWordLimit(60);
    } else {
        setWordLimit(20);
    }
  }, [isFullScreen]);

  // Robustly track the available space for the SVG using ResizeObserver
  useLayoutEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [isFullScreen]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // D3 Rendering Logic
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0 || data.length === 0) return;

    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    // Filter and Slice Data based on user controls
    let displayData = [...data]
      .sort((a, b) => b.value - a.value);
    
    // Apply text filter if exists
    if (filterText) {
        displayData = displayData.filter(d => d.text.toLowerCase().includes(filterText.toLowerCase()));
    }

    // Apply word count limit
    displayData = displayData.slice(0, wordLimit);

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("overflow", "visible")
      .style("display", "block");

    // Dynamic Font Sizing
    // Cap max font size strictly to prevent "zoomed in" look
    const minDim = Math.min(width, height);
    // Use smaller multiplier for card view
    const maxFontSize = isFullScreen 
        ? Math.min(90, minDim * 0.15) 
        : Math.min(35, minDim * 0.1); 
    
    const minFontSize = isFullScreen ? 18 : 10;

    const sizeScale = d3.scaleSqrt()
      .domain([d3.min(displayData, d => d.value) || 0, d3.max(displayData, d => d.value) || 100])
      .range([minFontSize, maxFontSize]);

    const weightScale = d3.scaleQuantize<string>()
      .domain([d3.min(displayData, d => d.value) || 0, d3.max(displayData, d => d.value) || 100])
      .range(["400", "500", "600", "700", "800"]);

    // Nodes preparation
    const nodes = displayData.map(d => {
      const size = sizeScale(d.value);
      // Approximate text width: Average char width ~0.55 of font size
      const textWidth = d.text.length * (size * 0.55); 
      const textHeight = size * 1.1; // Add line-height buffer
      
      return {
        ...d,
        size,
        textWidth,
        textHeight,
        weight: weightScale(d.value),
        x: centerX + (Math.random() - 0.5) * 50,
        y: centerY + (Math.random() - 0.5) * 50,
      };
    });

    // Physics Simulation
    const simulation = d3.forceSimulation<any>(nodes)
      // Gentle centering force - weakened slightly to allow spreading
      .force("x", d3.forceX(centerX).strength(isFullScreen ? 0.04 : 0.06))
      .force("y", d3.forceY(centerY).strength(isFullScreen ? 0.04 : 0.06))
      
      // Repulsion to prevent clustering - Increased strength for breathing room
      .force("charge", d3.forceManyBody().strength(d => -Math.pow(d.textWidth, 0.9) * 3.5))
      
      // IMPROVED: Collision radius increased significantly for "breathing room"
      // Radius based on half width + extra padding ensures separation and no overlap
      .force("collide", d3.forceCollide()
        .radius(d => d.textWidth * 0.6 + 10) // More padding
        .strength(1)
        .iterations(4)
      );

    // Render Text Groups
    const nodeGroups = svg.selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${centerX},${centerY})`) // Start at center
      .style("opacity", 0);

    const textNodes = nodeGroups.append("text")
      .text(d => d.text)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("font-family", "'Inter', sans-serif")
      .style("font-weight", d => d.weight)
      .style("font-size", d => `${d.size}px`)
      .style("fill", SENTIMENT_COLORS[sentiment])
      .style("opacity", (d, i) => {
         // Subtle opacity gradient for depth
         const freqRatio = (nodes.length - i) / nodes.length;
         return 0.6 + (freqRatio * 0.4); 
      })
      .style("cursor", "default")
      .style("user-select", "none");

    // Interactive behaviors
    nodeGroups
      .on("mouseover", (event, d) => {
        setHoveredWord(d);
        d3.select(event.currentTarget).select("text")
          .transition().duration(200)
          .style("opacity", 1)
          .style("filter", "drop-shadow(0 4px 6px rgba(0,0,0,0.2))")
          .attr("transform", "scale(1.1)");
      })
      .on("mouseout", (event, d) => {
        setHoveredWord(null);
        d3.select(event.currentTarget).select("text")
          .transition().duration(200)
          .style("opacity", (d: any) => {
             const idx = nodes.indexOf(d);
             const freqRatio = (nodes.length - idx) / nodes.length;
             return 0.6 + (freqRatio * 0.4);
          })
          .style("filter", "none")
          .attr("transform", "scale(1)");
      });

    // Simulation Tick
    simulation.on("tick", () => {
      nodeGroups.attr("transform", d => {
          const halfW = d.textWidth / 2;
          const halfH = d.textHeight / 2;
          
          // STRICT Boundary Constraints with padding
          const padX = isFullScreen ? 60 : 25;
          const padY = isFullScreen ? 80 : 30;
          
          // Improved constraint logic to be smoother
          d.x = Math.max(halfW + padX, Math.min(width - halfW - padX, d.x));
          d.y = Math.max(halfH + padY, Math.min(height - halfH - padY, d.y));

          return `translate(${d.x},${d.y})`;
      });
    });

    // Intro Animation
    nodeGroups.transition().duration(1000).ease(d3.easeCubicOut)
      .style("opacity", 1);

    return () => {
      simulation.stop();
    };
  }, [data, dimensions, sentiment, isFullScreen, wordLimit, filterText]); // Re-run when filters change

  // Classes
  const containerClasses = isFullScreen 
    ? "fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col"
    : "relative w-full h-[400px] bg-white rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col transition-all duration-300 hover:shadow-xl group overflow-hidden";

  return (
    <div ref={containerRef} className={containerClasses}>
        {/* Header */}
        <div className={`flex-none flex justify-between items-center w-full z-10 ${isFullScreen ? 'p-8 border-b border-slate-100' : 'p-6 border-b border-slate-50'}`}>
            <div className="flex items-center gap-3">
                 <h3 className={`font-bold uppercase tracking-wider flex items-center gap-3 ${isFullScreen ? 'text-4xl' : 'text-sm'}`} style={{ color: SENTIMENT_COLORS[sentiment] }}>
                    {sentiment}
                    <span className="opacity-40 font-semibold text-slate-400">Mentions</span>
                 </h3>
                 {isFullScreen && (
                    <span className="ml-4 text-sm font-medium bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full">
                        {wordLimit} words shown
                    </span>
                 )}
            </div>
            
            <div className="flex items-center gap-2">
                 {/* Settings Toggle */}
                <button
                    onClick={() => setShowControls(!showControls)}
                    className={`p-2 rounded-xl transition-all ${showControls ? 'bg-slate-100 text-slate-600' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'}`}
                    title="Filters & Settings"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                </button>

                {/* Maximize Toggle */}
                <button 
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="text-slate-300 hover:text-slate-600 hover:bg-slate-50 p-2.5 rounded-xl transition-all focus:outline-none active:scale-95"
                    title={isFullScreen ? "Exit Full Screen" : "Maximize View"}
                >
                    {isFullScreen ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                    )}
                </button>
            </div>
        </div>
        
        {/* Controls Panel */}
        {showControls && (
             <div className="absolute top-[72px] left-0 right-0 bg-white/95 backdrop-blur z-20 border-b border-slate-100 p-4 flex flex-col sm:flex-row gap-4 items-center animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">Word Count</span>
                    <input 
                        type="range" 
                        min="5" 
                        max={isFullScreen ? 100 : 40} 
                        value={wordLimit} 
                        onChange={(e) => setWordLimit(parseInt(e.target.value))}
                        className="w-full sm:w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                    />
                    <span className="text-xs font-mono text-slate-500 w-6">{wordLimit}</span>
                </div>
                <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                        type="text" 
                        placeholder="Filter words..." 
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="text-sm bg-transparent border-none focus:ring-0 placeholder-slate-400 text-slate-700 w-full"
                    />
                </div>
             </div>
        )}

        {/* Tooltip Overlay */}
        {hoveredWord && (
            <div 
                className="absolute z-30 pointer-events-none transition-all duration-150 ease-out left-1/2 -translate-x-1/2"
                style={{ top: isFullScreen ? '140px' : '80px' }}
            >
                <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ring-1 ring-white/10">
                    <span className="text-slate-300">{hoveredWord.text}</span>
                    <span className="h-3 w-px bg-slate-700"></span>
                    <span className="text-white tabular-nums">{hoveredWord.value} mentions</span>
                </div>
            </div>
        )}

        {/* SVG Wrapper */}
        <div ref={wrapperRef} className="flex-1 w-full min-h-0 relative bg-gradient-to-b from-slate-50/50 to-white">
             <svg 
                ref={svgRef} 
                className="w-full h-full block touch-none select-none"
             />
             {data.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm font-medium">
                    No data available
                </div>
             )}
        </div>
    </div>
  );
};

export default SentimentBubbleCloud;