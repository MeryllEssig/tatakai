import {
  ArrowLeftOutlined,
  HistoryOutlined,
  ImportOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import type { ReactElement } from 'react'

export type TatakaiIconName =
  | 'back'
  | 'history'
  | 'leaderboard'
  | 'matchmaking'
  | 'newGame'
  | 'newTournament'
  | 'import'
  | 'help'
  | 'addPlayer'
  | 'save'
  | 'reset'

type IconComponent = typeof ArrowLeftOutlined

const ICONS: Record<TatakaiIconName, IconComponent> = {
  back: ArrowLeftOutlined,
  history: HistoryOutlined,
  leaderboard: TrophyOutlined,
  matchmaking: TeamOutlined,
  newGame: PlusCircleOutlined,
  newTournament: PlusCircleOutlined,
  import: ImportOutlined,
  help: QuestionCircleOutlined,
  addPlayer: UserAddOutlined,
  save: SaveOutlined,
  reset: ReloadOutlined,
}

export interface TatakaiIconProps {
  name: TatakaiIconName
  className?: string
}

export function TatakaiIcon({ name, className }: TatakaiIconProps): ReactElement {
  const IconComponent = ICONS[name]
  return <IconComponent className={className} aria-hidden />
}
