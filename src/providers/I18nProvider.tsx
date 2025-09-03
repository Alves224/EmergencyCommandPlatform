// YSOD Emergency Command Platform - Internationalization Provider
// English/Arabic with RTL support
// Saudi Aramco: Company General Use

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Language = 'en' | 'ar'
type Direction = 'ltr' | 'rtl'

interface I18nContextType {
  lang: Language
  dir: Direction
  setLang: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.incidents': 'Incidents',
    'nav.tasks': 'Tasks & SOPs',
    'nav.comms': 'Communications Hub',
    'nav.situational': 'Situational Awareness',
    'nav.dispatch': 'Dispatch & Resources',
    'nav.access': 'Access & Perimeter',
    'nav.muster': 'Muster & Headcount',
    'nav.reporting': 'Reporting & AAR',
    'nav.admin': 'Administration',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.refresh': 'Refresh',

    // Incidents
    'incidents.title': 'Incident Management',
    'incidents.subtitle': 'Monitor and manage all security and operational incidents',
    'incidents.new': 'New Incident',
    'incidents.status.open': 'Open',
    'incidents.status.contained': 'Contained',
    'incidents.status.closed': 'Closed',
    'incidents.priority.high': 'High',
    'incidents.priority.medium': 'Medium',
    'incidents.priority.low': 'Low',
    'incidents.priority.critical': 'Critical',

    // Timeline
    'timeline.title': 'Incident Timeline',
    'timeline.hash_verified': 'Hash Verified',
    'timeline.hash_corrupted': 'Hash Corrupted',
    'timeline.actions.created': 'Created',
    'timeline.actions.status_changed': 'Status Changed',
    'timeline.actions.units_assigned': 'Units Assigned',
    'timeline.actions.note_added': 'Note Added',
    'timeline.actions.media_attached': 'Media Attached',
    'timeline.actions.camera_bookmarked': 'Camera Bookmarked',
    'timeline.actions.ptz_command': 'PTZ Command',

    // Camera Wall
    'cameras.title': 'Camera Wall',
    'cameras.bookmark': 'Bookmark',
    'cameras.ptz.left': 'Left',
    'cameras.ptz.right': 'Right',
    'cameras.ptz.up': 'Up',
    'cameras.ptz.down': 'Down',
    'cameras.ptz.zoom_in': 'Zoom In',
    'cameras.ptz.zoom_out': 'Zoom Out',

    // Dual Approval
    'approval.title': 'Dual-Approval Control',
    'approval.gate_id': 'Gate ID',
    'approval.action.lock': 'Lock',
    'approval.action.unlock': 'Unlock',
    'approval.action.announce': 'Announce',
    'approval.supervisor_approver': 'Supervisor Approver',
    'approval.commander_approver': 'Commander Approver',
    'approval.request': 'Request',
    'approval.pending': 'Pending Approval',
    'approval.approved': 'Approved',
    'approval.denied': 'Denied',
    'approval.executed': 'Executed',

    // Muster
    'muster.title': 'Muster & Headcount',
    'muster.zones': 'Muster Zones',
    'muster.scan': 'Scan / Manual Entry',
    'muster.checkin': 'Check-in to',
    'muster.count': 'Count',
    'muster.all_clear': 'All Clear',

    // Broadcast
    'broadcast.title': 'Broadcast Alerts',
    'broadcast.site': 'Site',
    'broadcast.role': 'Role',
    'broadcast.channel': 'Channel',
    'broadcast.message': 'Message',
    'broadcast.send': 'Send Broadcast',
    'broadcast.all': 'ALL',

    // Footer
    'footer.aramco': 'Saudi Aramco: Company General Use'
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.incidents': 'الحوادث',
    'nav.tasks': 'المهام والإجراءات',
    'nav.comms': 'مركز الاتصالات',
    'nav.situational': 'الوعي الموقفي',
    'nav.dispatch': 'الإرسال والموارد',
    'nav.access': 'الوصول والمحيط',
    'nav.muster': 'التجمع والعدد',
    'nav.reporting': 'التقارير والمراجعة',
    'nav.admin': 'الإدارة',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.view': 'عرض',
    'common.create': 'إنشاء',
    'common.update': 'تحديث',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.refresh': 'تحديث',

    // Incidents
    'incidents.title': 'إدارة الحوادث',
    'incidents.subtitle': 'مراقبة ومتابعة جميع الحوادث الأمنية والتشغيلية',
    'incidents.new': 'حادث جديد',
    'incidents.status.open': 'مفتوح',
    'incidents.status.contained': 'محتوى',
    'incidents.status.closed': 'مغلق',
    'incidents.priority.high': 'عالي',
    'incidents.priority.medium': 'متوسط',
    'incidents.priority.low': 'منخفض',
    'incidents.priority.critical': 'حرج',

    // Timeline
    'timeline.title': 'جدول زمني للحادث',
    'timeline.hash_verified': 'تم التحقق من التشفير',
    'timeline.hash_corrupted': 'التشفير تالف',
    'timeline.actions.created': 'تم الإنشاء',
    'timeline.actions.status_changed': 'تغير الحالة',
    'timeline.actions.units_assigned': 'تم تعيين الوحدات',
    'timeline.actions.note_added': 'تمت إضافة ملاحظة',
    'timeline.actions.media_attached': 'تم إرفاق وسائط',
    'timeline.actions.camera_bookmarked': 'تم وضع إشارة مرجعية للكاميرا',
    'timeline.actions.ptz_command': 'أمر PTZ',

    // Camera Wall
    'cameras.title': 'جدار الكاميرات',
    'cameras.bookmark': 'إشارة مرجعية',
    'cameras.ptz.left': 'يسار',
    'cameras.ptz.right': 'يمين',
    'cameras.ptz.up': 'أعلى',
    'cameras.ptz.down': 'أسفل',
    'cameras.ptz.zoom_in': 'تكبير',
    'cameras.ptz.zoom_out': 'تصغير',

    // Dual Approval
    'approval.title': 'التحكم بالموافقة المزدوجة',
    'approval.gate_id': 'رقم البوابة',
    'approval.action.lock': 'قفل',
    'approval.action.unlock': 'فتح',
    'approval.action.announce': 'إعلان',
    'approval.supervisor_approver': 'المشرف الموافق',
    'approval.commander_approver': 'القائد الموافق',
    'approval.request': 'طلب',
    'approval.pending': 'في انتظار الموافقة',
    'approval.approved': 'تمت الموافقة',
    'approval.denied': 'مرفوض',
    'approval.executed': 'تم التنفيذ',

    // Muster
    'muster.title': 'التجمع وعد الأشخاص',
    'muster.zones': 'مناطق التجمع',
    'muster.scan': 'مسح / إدخال يدوي',
    'muster.checkin': 'تسجيل الوصول إلى',
    'muster.count': 'العدد',
    'muster.all_clear': 'خلو تام',

    // Broadcast
    'broadcast.title': 'تنبيهات البث',
    'broadcast.site': 'الموقع',
    'broadcast.role': 'الدور',
    'broadcast.channel': 'القناة',
    'broadcast.message': 'الرسالة',
    'broadcast.send': 'إرسال البث',
    'broadcast.all': 'الكل',

    // Footer
    'footer.aramco': 'أرامكو السعودية: استخدام عام للشركة'
  }
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  dir: 'ltr',
  setLang: () => {},
  t: (key: string) => key
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const defaultLang = (import.meta.env.VITE_LOCALE_DEFAULT as Language) || 'en'
  const [lang, setLang] = useState<Language>(defaultLang)
  
  const dir: Direction = lang === 'ar' ? 'rtl' : 'ltr'

  const t = useMemo(() => {
    return (key: string): string => {
      return translations[lang][key as keyof typeof translations['en']] || key
    }
  }, [lang])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    document.documentElement.setAttribute('data-lang', lang)
  }, [lang, dir])

  const value = useMemo(() => ({ lang, dir, setLang, t }), [lang, dir, t])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}