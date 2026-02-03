import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { scaleLinear } from 'd3-scale';
import { getOperationColor, formatDuration } from '../../utils/traceDataProcessor';

const FlameGraph = memo(({ events, onSelectEvent, selectedEvent, searchTerm }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [transform, setTransform] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const ROW_HEIGHT = 24;
  const ROW_PADDING = 2;
  const LABEL_PADDING = 4;
  const MIN_TEXT_WIDTH = 50;

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate time range
  const timeRange = useCallback(() => {
    if (!events || events.length === 0) return { start: 0, end: 1 };

    const start = Math.min(...events.map(e => e.ts));
    const end = Math.max(...events.map(e => e.ts + e.dur));
    return { start, end };
  }, [events]);

  // Draw flame graph
  useEffect(() => {
    if (!canvasRef.current || !events || events.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;

    if (width === 0 || height === 0) return;

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    const { start, end } = timeRange();
    const duration = end - start;

    // Create time scale
    const timeScale = scaleLinear()
      .domain([start, end])
      .range([0, width]);

    // Apply transform
    ctx.save();
    ctx.translate(transform.panX, transform.panY);
    ctx.scale(transform.zoom, 1);

    // Group events by thread for lane layout
    const threadGroups = {};
    events.forEach(event => {
      const threadKey = `${event.pid}_${event.tid}`;
      if (!threadGroups[threadKey]) {
        threadGroups[threadKey] = [];
      }
      threadGroups[threadKey].push(event);
    });

    let yOffset = 10;

    // Draw each thread's events
    Object.entries(threadGroups).forEach(([threadKey, threadEvents]) => {
      // Sort by depth (flame graph style)
      const sortedEvents = [...threadEvents].sort((a, b) => a.depth - b.depth);

      // Find max depth for this thread
      const maxDepth = Math.max(...sortedEvents.map(e => e.depth || 0));

      // Draw thread label
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Thread ${threadKey.split('_')[1]}`, 10 / transform.zoom, yOffset + 12);

      // Draw events
      sortedEvents.forEach(event => {
        const x = timeScale(event.ts);
        const eventWidth = timeScale(event.ts + event.dur) - x;
        const y = yOffset + 20 + (event.depth || 0) * (ROW_HEIGHT + ROW_PADDING);

        if (eventWidth < 0.5) return; // Skip very small events

        // Determine if event matches search
        const isSearchMatch = searchTerm && event.name.toLowerCase().includes(searchTerm.toLowerCase());
        const isSelected = selectedEvent && selectedEvent.id === event.id;
        const isHovered = hoveredEvent && hoveredEvent.id === event.id;

        // Get color
        let color = getOperationColor(event.name, event.cat);

        // Adjust color for search/selection
        if (isSearchMatch) {
          color = '#fbbf24'; // yellow for search matches
        }
        if (isSelected) {
          color = '#ef4444'; // red for selected
        }

        // Draw rectangle
        ctx.fillStyle = color;
        ctx.fillRect(x, y, eventWidth, ROW_HEIGHT);

        // Draw border for hovered/selected
        if (isHovered || isSelected) {
          ctx.strokeStyle = isSelected ? '#dc2626' : '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, eventWidth, ROW_HEIGHT);
        }

        // Draw text if there's enough space
        if (eventWidth * transform.zoom > MIN_TEXT_WIDTH) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '11px sans-serif';
          ctx.textBaseline = 'middle';

          const text = event.name;
          const textWidth = ctx.measureText(text).width;
          const maxTextWidth = eventWidth - LABEL_PADDING * 2;

          if (textWidth <= maxTextWidth) {
            ctx.fillText(text, x + LABEL_PADDING, y + ROW_HEIGHT / 2);
          } else {
            // Truncate text
            let truncated = text;
            while (ctx.measureText(truncated + '...').width > maxTextWidth && truncated.length > 0) {
              truncated = truncated.slice(0, -1);
            }
            ctx.fillText(truncated + '...', x + LABEL_PADDING, y + ROW_HEIGHT / 2);
          }
        }

        // Store event bounds for hit detection
        event._bounds = { x, y, width: eventWidth, height: ROW_HEIGHT };
      });

      yOffset += 40 + (maxDepth + 1) * (ROW_HEIGHT + ROW_PADDING);
    });

    ctx.restore();
  }, [events, dimensions, transform, hoveredEvent, selectedEvent, searchTerm, timeRange]);

  // Mouse move handler for hover
  const handleMouseMove = useCallback((e) => {
    if (!canvasRef.current || !events) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transform.panX) / transform.zoom;
    const mouseY = e.clientY - rect.top - transform.panY;

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setTransform(prev => ({
        ...prev,
        panX: prev.panX + dx,
        panY: prev.panY + dy,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Find hovered event
    let found = null;
    for (const event of events) {
      if (event._bounds) {
        const { x, y, width, height } = event._bounds;
        if (mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height) {
          found = event;
          break;
        }
      }
    }

    if (found) {
      setHoveredEvent(found);
      setTooltip({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        content: {
          name: found.name,
          duration: formatDuration(found.dur),
          selfTime: formatDuration(found.selfTime || found.dur),
          category: found.cat || 'unknown',
        },
      });
    } else {
      setHoveredEvent(null);
      setTooltip({ visible: false, x: 0, y: 0, content: null });
    }
  }, [events, transform, isDragging, dragStart]);

  // Mouse click handler
  const handleClick = useCallback(() => {
    if (hoveredEvent) {
      onSelectEvent(hoveredEvent);
    }
  }, [hoveredEvent, onSelectEvent]);

  // Mouse wheel handler for zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(10, prev.zoom * delta)),
    }));
  }, []);

  // Mouse down handler for drag
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="flame-graph-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoveredEvent(null);
          setTooltip({ visible: false, x: 0, y: 0, content: null });
          setIsDragging(false);
        }}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />

      {tooltip.visible && tooltip.content && (
        <div
          className="flame-tooltip"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y + 10,
          }}
        >
          <div className="tooltip-row">
            <strong>{tooltip.content.name}</strong>
          </div>
          <div className="tooltip-row">
            Duration: {tooltip.content.duration}
          </div>
          <div className="tooltip-row">
            Self Time: {tooltip.content.selfTime}
          </div>
          <div className="tooltip-row">
            Category: {tooltip.content.category}
          </div>
        </div>
      )}

      <style>{`
        .flame-graph-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .flame-graph-container canvas {
          display: block;
        }

        .flame-tooltip {
          position: absolute;
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 6px;
          padding: 0.75rem;
          font-size: 0.75rem;
          color: #f3f4f6;
          pointer-events: none;
          z-index: 1000;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          min-width: 200px;
        }

        .tooltip-row {
          margin-bottom: 0.25rem;
        }

        .tooltip-row:last-child {
          margin-bottom: 0;
        }

        .tooltip-row strong {
          color: #6366f1;
        }
      `}</style>
    </div>
  );
});

FlameGraph.displayName = 'FlameGraph';

export default FlameGraph;
