import { useState, useEffect } from 'react'

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('.rule-section')
      const scrollPosition = window.scrollY + 100
      
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        const absoluteTop = rect.top + window.scrollY
        const absoluteBottom = absoluteTop + rect.height
        
        if (scrollPosition >= absoluteTop && scrollPosition < absoluteBottom) {
          setActiveSection(index)
        }
      })
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (index) => {
    const element = document.querySelectorAll('.rule-section')[index]
    const yOffset = -80
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
    
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return { activeSection, scrollToSection }
} 