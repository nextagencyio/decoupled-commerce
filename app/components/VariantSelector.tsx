'use client'

import clsx from 'clsx'
import { ShopifyProductVariant } from '@/lib/types'

interface VariantSelectorProps {
  options: {
    id: string
    name: string
    values: string[]
  }[]
  variants: ShopifyProductVariant[]
  selectedOptions: Record<string, string>
  onOptionChange: (name: string, value: string) => void
}

export default function VariantSelector({
  options,
  variants,
  selectedOptions,
  onOptionChange,
}: VariantSelectorProps) {
  // Check if a specific option value is available based on current selections
  const isOptionAvailable = (optionName: string, value: string) => {
    // Create a test selection with this option value
    const testSelection = { ...selectedOptions, [optionName]: value }

    // Find if any variant matches this selection and is available
    return variants.some((variant) => {
      const matches = variant.selectedOptions.every(
        (opt) => testSelection[opt.name] === opt.value
      )
      return matches && variant.availableForSale
    })
  }

  if (options.length === 0 || (options.length === 1 && options[0].values.length === 1)) {
    return null // Don't show selector for single-variant products
  }

  return (
    <div className="space-y-6">
      {options.map((option) => (
        <div key={option.id}>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            {option.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value
              const isAvailable = isOptionAvailable(option.name, value)

              // Special rendering for color options
              if (option.name.toLowerCase() === 'color') {
                return (
                  <button
                    key={value}
                    onClick={() => onOptionChange(option.name, value)}
                    disabled={!isAvailable}
                    className={clsx(
                      'relative w-10 h-10 rounded-full border-2 transition-all',
                      isSelected
                        ? 'border-primary-600 ring-2 ring-primary-600 ring-offset-2'
                        : 'border-gray-300 hover:border-gray-400',
                      !isAvailable && 'opacity-30 cursor-not-allowed'
                    )}
                    title={value}
                  >
                    <span
                      className="absolute inset-1 rounded-full"
                      style={{ backgroundColor: value.toLowerCase() }}
                    />
                    {!isAvailable && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-full h-0.5 bg-gray-400 rotate-45" />
                      </span>
                    )}
                  </button>
                )
              }

              // Default button rendering for other options (size, etc.)
              return (
                <button
                  key={value}
                  onClick={() => onOptionChange(option.name, value)}
                  disabled={!isAvailable}
                  className={clsx(
                    'px-4 py-2 text-sm font-medium rounded-lg border transition-all',
                    isSelected
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400',
                    !isAvailable && 'opacity-50 cursor-not-allowed line-through'
                  )}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
