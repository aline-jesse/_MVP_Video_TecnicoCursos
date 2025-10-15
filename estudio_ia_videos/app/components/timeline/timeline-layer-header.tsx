/**
 * Timeline Layer Header Component
 * Controls for individual timeline layers
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Volume2, 
  VolumeX, 
  MoreVertical,
  Edit3,
  Trash2,
  Copy
} from 'lucide-react';
import { TimelineLayer } from '@/lib/types/timeline-types';

interface TimelineLayerHeaderProps {
  layer: TimelineLayer;
  onToggleVisibility: (layerId: string) => void;
  onToggleLock: (layerId: string) => void;
  onRename: (layerId: string, name: string) => void;
  onDelete: (layerId: string) => void;
}

export function TimelineLayerHeader({
  layer,
  onToggleVisibility,
  onToggleLock,
  onRename,
  onDelete
}: TimelineLayerHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = () => {
    if (editName.trim() && editName !== layer.name) {
      onRename(layer.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditName(layer.name);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      className="timeline-layer-header relative flex items-center p-2 border-b border-gray-700 hover:bg-gray-750 transition-colors group"
      style={{ height: layer.height }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Layer color indicator */}
      <div
        className="w-1 h-full absolute left-0 top-0"
        style={{ backgroundColor: layer.color }}
      />

      {/* Layer info */}
      <div className="flex-1 ml-2">
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-600 text-white text-sm px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div
            className="text-sm text-gray-200 font-medium cursor-pointer hover:text-white"
            onClick={() => setIsEditing(true)}
          >
            {layer.name}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-1">
          {layer.elements.length} element{layer.elements.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Layer controls */}
      <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
        {/* Visibility toggle */}
        <button
          onClick={() => onToggleVisibility(layer.id)}
          className={`p-1 rounded hover:bg-gray-600 transition-colors ${
            layer.visible ? 'text-gray-300 hover:text-white' : 'text-gray-500'
          }`}
          title={layer.visible ? 'Hide layer' : 'Show layer'}
        >
          {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>

        {/* Lock toggle */}
        <button
          onClick={() => onToggleLock(layer.id)}
          className={`p-1 rounded hover:bg-gray-600 transition-colors ${
            layer.locked ? 'text-yellow-400' : 'text-gray-300 hover:text-white'
          }`}
          title={layer.locked ? 'Unlock layer' : 'Lock layer'}
        >
          {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>

        {/* Volume control (for audio layers) */}
        {layer.type === 'audio' && (
          <button
            className="p-1 rounded hover:bg-gray-600 transition-colors text-gray-300 hover:text-white"
            title="Audio settings"
          >
            <Volume2 size={14} />
          </button>
        )}

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-gray-600 transition-colors text-gray-300 hover:text-white"
            title="Layer options"
          >
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 py-1 min-w-36"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2"
              >
                <Edit3 size={12} />
                <span>Rename</span>
              </button>
              
              <button
                onClick={() => {
                  // Copy layer functionality would go here
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700 flex items-center space-x-2"
              >
                <Copy size={12} />
                <span>Duplicate</span>
              </button>
              
              <hr className="border-gray-600 my-1" />
              
              <button
                onClick={() => {
                  onDelete(layer.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 flex items-center space-x-2"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}