import React from 'react';
import { useTranslation } from 'react-i18next';

const COUNT = 8;

function FAQ() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-6xl px-4" style={{ marginTop: '100px', marginBottom: '60px' }}>
      <h1 className="text-center mb-5 text-foreground" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
        {t('faq.title')}
      </h1>
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {Array.from({ length: COUNT }, (_, i) => i + 1).map((n, i) => (
          <details
            key={n}
            open={i === 0}
            className="rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <summary className="cursor-pointer p-4 font-medium">{t(`faq.q${n}`)}</summary>
            <div className="border-t px-4 py-3 text-sm text-muted-foreground">
              {n === 8 ? (
                <span>
                  {t('faq.contactLead')} <strong className="text-foreground">support@wheelmatch.com</strong> {t('faq.contactAnd')} <strong className="text-foreground">+216 92195666</strong>. {t('faq.contactEnd')}
                </span>
              ) : (
                t(`faq.a${n}`)
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default FAQ;
