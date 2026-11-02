'use client';

import { useState } from 'react';
import { site } from '@/lib/config';

const text = {
  en: {
    intro: 'The installer is not code-signed yet, so Windows Defender SmartScreen shows a blue “Windows protected your PC” window the first time you run it. This is expected for new apps. To continue:',
    step1: 'Click “More info”.',
    step2: 'Check that the app name is the Atomvs installer, then click “Run anyway”.',
    step3: 'The installer opens and installs Atomvs for your user account. No administrator rights are needed.',
    title: 'Windows protected your PC',
    body: 'Microsoft Defender SmartScreen prevented an unrecognized app from starting. Running this app might put your PC at risk.',
    more: 'More info',
    app: 'App:',
    publisher: 'Publisher:',
    unknown: 'Unknown publisher',
    run: 'Run anyway',
    dont: 'Don’t run',
    here: 'click here',
  },
  ar: {
    intro: 'برنامج التثبيت غير موقّع رقمياً بعد، لذلك يُظهر Windows Defender SmartScreen نافذة زرقاء بعنوان «حماية الكمبيوتر بواسطة Windows» عند أول تشغيل. هذا متوقع للتطبيقات الجديدة. للمتابعة:',
    step1: 'اضغط على «مزيد من المعلومات».',
    step2: 'تأكد أن اسم التطبيق هو برنامج تثبيت Atomvs، ثم اضغط «تشغيل على أي حال».',
    step3: 'يفتح برنامج التثبيت ويثبّت Atomvs لحساب المستخدم الخاص بك، دون الحاجة إلى صلاحيات المسؤول.',
    title: 'حماية الكمبيوتر بواسطة Windows',
    body: 'منع Microsoft Defender SmartScreen بدء تشغيل تطبيق غير معروف. قد يؤدي تشغيل هذا التطبيق إلى تعريض الكمبيوتر للخطر.',
    more: 'مزيد من المعلومات',
    app: 'التطبيق:',
    publisher: 'الناشر:',
    unknown: 'ناشر غير معروف',
    run: 'تشغيل على أي حال',
    dont: 'عدم التشغيل',
    here: 'اضغط هنا',
  },
};

/** A drawing of the SmartScreen window, with the button to press highlighted. */
function Dialog({ t, details, installerName }: { t: (typeof text)['en']; details: boolean; installerName: string }) {
  const highlight = 'rounded-md ring-2 ring-amber-300 ring-offset-2 ring-offset-[#0b5fa8]';
  return (
    <div className="rounded-xl bg-[#0b5fa8] p-5 text-left text-white shadow-lg" aria-hidden="true">
      <div className="text-lg font-semibold">{t.title}</div>
      <p className="mt-2 text-sm text-white/85">{t.body}</p>
      {details ? (
        <div className="mt-3 text-sm text-white/85">
          <div>{t.app} {installerName}</div>
          <div>{t.publisher} {t.unknown}</div>
        </div>
      ) : (
        <span className={`mt-3 inline-block text-sm underline ${highlight}`}>{t.more}</span>
      )}
      <div className="mt-5 flex justify-end gap-2 text-sm">
        {details && <span className={`border border-white/70 px-4 py-1.5 ${highlight}`}>{t.run}</span>}
        <span className="border border-white/70 px-4 py-1.5">{t.dont}</span>
      </div>
    </div>
  );
}

/** How to get past SmartScreen on the first run, in English and Arabic. */
/** `installerName`: the file the user downloaded (the latest release's), shown as the app name in the dialog. */
export function SmartScreenGuide({ installerName = site.windowsInstallerName }: { installerName?: string }) {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const t = text[lang];
  const tab = (id: 'en' | 'ar', label: string) => (
    <button type="button" role="tab" aria-selected={lang === id} onClick={() => setLang(id)}
      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${lang === id ? 'bg-hover text-ink' : 'text-muted hover:text-ink'}`}>
      {label}
    </button>
  );
  return (
    <div className="rounded-2xl border border-line-strong bg-panel p-6 sm:p-8">
      <div className="mb-5 flex gap-1" role="tablist" aria-label="Language">
        {tab('en', 'English')}
        {tab('ar', 'العربية')}
      </div>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} className="flex flex-col gap-6">
        <p className="max-w-3xl text-muted">{t.intro}</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="font-medium">1. {t.step1}</p>
            <Dialog t={t} details={false} installerName={installerName} />
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-medium">2. {t.step2}</p>
            <Dialog t={t} details installerName={installerName} />
          </div>
        </div>
        <p className="font-medium">3. {t.step3}</p>
      </div>
    </div>
  );
}
