import { Button } from '@/components/retroui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/retroui/Card'
import type { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PageContentHeader } from '../../ui/components/page-content-header'
import { TatakaiIcon } from '../../ui/components/tatakai-icon'
import { buildHelpContent } from './help-content'

export function HelpPage(): ReactElement {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const sections = buildHelpContent(t)

  return (
    <div className="flex flex-col gap-4">
      <PageContentHeader title={t('help.title')} subtitle={t('help.subtitle')}>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          aria-label={t('help.backToHome')}
          onClick={() => navigate('/')}
        >
          <TatakaiIcon name="back" className="text-base" />
        </Button>
      </PageContentHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.sectionId}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-800 whitespace-pre-line">{section.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
