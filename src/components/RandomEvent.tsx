
import React, { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Sparkles, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RandomEventProps {
  eventId: number;
}

const RandomEvent: React.FC<RandomEventProps> = ({ eventId }) => {
  const { state, dispatch } = useGame();
  const event = state.activeEvents.find(e => e.id === eventId);
  
  if (!event) return null;
  
  const getEventIcon = () => {
    switch (event.type) {
      case 'positive':
        return <Sparkles className="w-5 h-5 text-green-500" />;
      case 'negative':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'neutral':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };
  
  const getEventColorClass = () => {
    switch (event.type) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'negative':
        return 'border-red-200 bg-red-50';
      case 'neutral':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };
  
  // Auto-resolve the event when its duration expires
  useEffect(() => {
    if (event.duration) {
      const eventStartTime = event.id - event.id % 1000; // Extract timestamp from ID
      const remainingTime = (eventStartTime + (event.duration * 1000)) - Date.now();
      
      if (remainingTime > 0) {
        const timer = setTimeout(() => {
          dispatch({ type: 'RESOLVE_EVENT', payload: event.id });
        }, remainingTime);
        
        return () => clearTimeout(timer);
      }
    }
  }, [event, dispatch]);
  
  return (
    <div className={cn(
      "rounded-lg border p-3 flex items-start",
      getEventColorClass()
    )}>
      <div className="mt-0.5">
        {getEventIcon()}
      </div>
      <div className="ml-3">
        <h4 className="font-medium text-sm">{event.title}</h4>
        <p className="text-xs text-gray-600">{event.description}</p>
        {event.duration && (
          <div className="mt-1 text-xs text-gray-500">
            Active for {event.duration} seconds
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomEvent;
