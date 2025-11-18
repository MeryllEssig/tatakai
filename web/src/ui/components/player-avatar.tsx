import Avatar from 'boring-avatars'
import type { ReactElement } from 'react'

interface PlayerAvatarViewProps {
  playerId: string
  displayName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP: Record<NonNullable<PlayerAvatarViewProps['size']>, number> = {
  sm: 36,
  md: 44,
  lg: 52,
}

export function PlayerAvatarView({
  playerId,
  displayName,
  size = 'md',
  className,
}: PlayerAvatarViewProps): ReactElement {
  const pixelSize = SIZE_MAP[size]

  return (
    <div
      className={`inline-flex items-center justify-center ${className ?? ''}`.trim()}
      role="img"
      aria-label={displayName}
    >
      <Avatar
        size={pixelSize}
        name={playerId + 'xyu'}
        variant="beam"
        colors={[
          '#FF3FA4',
          '#FF9F1C',
          '#72F1B8',
          '#3EC1D3',
          '#7C4DFF',
          '#FF6E6C',
          '#F9C80E',
          '#00F5D4',
          '#EF709D',
          '#B5179E',
        ]}
      />
    </div>
  )
}

export type PlayerAvatarProps = PlayerAvatarViewProps

export function PlayerAvatar(props: PlayerAvatarProps): ReactElement {
  return <PlayerAvatarView {...props} />
}
