// YSOD Emergency Command Platform - Language Switcher Component
// Saudi Aramco: Company General Use

import React from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/providers/I18nProvider'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n()

  return (
    <div className="flex items-center gap-1">
      <Languages className="w-4 h-4 text-muted-foreground mr-1" />
      <Button 
        variant={lang === 'en' ? 'default' : 'ghost'} 
        size="sm"
        onClick={() => setLang('en')}
        className="h-8 px-2 text-xs"
      >
        EN
      </Button>
      <Button 
        variant={lang === 'ar' ? 'default' : 'ghost'} 
        size="sm"
        onClick={() => setLang('ar')}
        className="h-8 px-2 text-xs"
      >
        AR
      </Button>
    </div>
  )
}