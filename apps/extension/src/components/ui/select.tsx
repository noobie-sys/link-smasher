"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronDownIcon } from "lucide-react"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export function Select({ value, onChange, options, placeholder, className }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const selectRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = React.useState<{ top: number; left: number; width: number } | null>(null)

  // Calculate dropdown position when opening
  React.useEffect(() => {
    if (isOpen && selectRef.current) {
      const updatePosition = () => {
        if (selectRef.current) {
          const rect = selectRef.current.getBoundingClientRect()
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width
          })
        }
      }
      
      updatePosition()
      
      // Update position on scroll or resize
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    } else {
      setDropdownPosition(null)
    }
  }, [isOpen])

  React.useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // If click is inside dropdown, don't close
      if (dropdownRef.current?.contains(target)) {
        return
      }
      
      // If click is inside select button, don't close (button handles its own toggle)
      if (selectRef.current?.contains(target)) {
        return
      }
      
      // Click is outside both, close dropdown
      setIsOpen(false)
    }

    // Use a small delay to ensure dropdown clicks register first
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside, true)
    }, 10)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("click", handleClickOutside, true)
    }
  }, [isOpen])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div ref={selectRef} className={className} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '6px 10px',
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#007bff'
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = '#ddd'
          }
        }}
      >
        <span style={{ color: selectedOption ? '#333' : '#999' }}>
          {selectedOption ? selectedOption.label : placeholder || 'Select...'}
        </span>
        <ChevronDownIcon
          size={14}
          style={{
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: '#666'
          }}
        />
      </button>

      {isOpen && dropdownPosition && createPortal(
        <div
          ref={dropdownRef}
          className="select-dropdown"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000000,
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease',
            pointerEvents: 'auto',
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-8px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onChange(option.value)
                setIsOpen(false)
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                background: value === option.value ? '#f0f7ff' : 'transparent',
                color: value === option.value ? '#007bff' : '#333',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.15s ease',
                fontWeight: value === option.value ? '500' : 'normal'
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = '#f5f5f5'
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

