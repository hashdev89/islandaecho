'use client'

import { useState, useEffect } from 'react'

interface WordSliderProps {
  words: string[]
  interval?: number
}

export default function WordSlider({ words, interval = 3000 }: WordSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [surferPosition, setSurferPosition] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length)
        setIsAnimating(false)
      }, 1500) // Increased to 1.5 seconds for smoother fade
    }, interval)

    return () => clearInterval(timer)
  }, [words.length, interval])

  // Animate surfer jumping to first letter of each word
  useEffect(() => {
    setSurferPosition(0) // Always start at first letter
  }, [currentIndex])

  const currentWord = words[currentIndex]
  const lastLetterIndex = currentWord.length - 1

  return (
    <div className="relative h-16 md:h-20 overflow-hidden">
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          isAnimating ? 'animate-smooth-fade-out' : 'animate-smooth-fade-in'
        }`}
      >
                 <span className="text-5xl md:text-7xl font-extrabold drop-shadow-lg text-white relative">
           {currentWord.split('').map((letter, index) => (
             <span
               key={index}
               className={`inline-block transition-all duration-300 ${
                 index === surferPosition ? 'animate-surfer-jump' : ''
               }`}
             >
               {letter}
             </span>
           ))}
           {/* Surfing Man - Same level as text */}
           <div 
             className={`absolute top-0 transition-all duration-1000 ease-in-out ${
               isAnimating ? 'opacity-0' : 'opacity-100'
             }`}
             style={{
               left: `${(surferPosition / currentWord.length) * 100}%`,
               transform: 'translateX(-50%)'
             }}
           >
             <div className="animate-surfer-bounce">
               🏄‍♂️
             </div>
           </div>
           
           {/* Elephant - Walking on last letter */}
           <div 
             className={`absolute top-0 transition-all duration-1000 ease-in-out ${
               isAnimating ? 'opacity-0' : 'opacity-100'
             }`}
             style={{
               left: `${(lastLetterIndex / currentWord.length) * 100}%`,
               transform: 'translateX(-50%)'
             }}
           >
             <div className="animate-elephant-walk">
               🐘
             </div>
           </div>
         </span>
      </div>
    </div>
  )
}
