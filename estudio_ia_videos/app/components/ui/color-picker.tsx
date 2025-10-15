

'use client'

import { useState } from 'react'
import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Input } from './input'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#008000', '#800000', '#008080', '#000080', '#808080'
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-12 h-12 p-0 border-2 ${className}`}
          style={{ backgroundColor: color }}
        >
          <span className="sr-only">Escolher cor</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Cor personalizada</label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-12 h-10 p-0 border-0"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Cores pré-definidas</label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {presetColors.map((presetColor) => (
                <Button
                  key={presetColor}
                  variant="outline"
                  className="w-8 h-8 p-0"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => {
                    onChange(presetColor)
                    setIsOpen(false)
                  }}
                >
                  <span className="sr-only">{presetColor}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

