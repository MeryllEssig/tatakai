import type { TFunction } from 'i18next'

export type HelpSectionId = 'principles' | 'ranking' | 'matchmaking'

export interface HelpContent {
  sectionId: HelpSectionId
  title: string
  body: string
}

export function buildHelpContent(t: TFunction): HelpContent[] {
  return [
    {
      sectionId: 'principles',
      title: t('help.principles.title'),
      body: t('help.principles.body'),
    },
    {
      sectionId: 'ranking',
      title: t('help.ranking.title'),
      body: t('help.ranking.body'),
    },
    {
      sectionId: 'matchmaking',
      title: t('help.matchmaking.title'),
      body: t('help.matchmaking.body'),
    },
  ]
}
