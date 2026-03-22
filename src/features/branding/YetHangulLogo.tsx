type YetHangulLogoProps = {
  compact?: boolean
}

export function YetHangulLogo({ compact = false }: YetHangulLogoProps) {
  return (
    <div aria-hidden="true" className={`brand-mark ${compact ? 'brand-mark-compact' : ''}`}>
      <svg role="img" viewBox="0 0 120 120">
        <title>YetHangul logo</title>
        <defs>
          <linearGradient id="sealGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#b14d1f" />
            <stop offset="100%" stopColor="#7a2f12" />
          </linearGradient>
        </defs>
        <rect fill="url(#sealGradient)" height="120" rx="28" width="120" />
        <path d="M28 33h64v9H65v45H55V42H28z" fill="#fff8ef" />
        <path
          d="M39 52c0-11 9-20 21-20s21 9 21 20-9 20-21 20-21-9-21-20Zm11 0c0 5.7 4.3 10 10 10s10-4.3 10-10-4.3-10-10-10-10 4.3-10 10Z"
          fill="#f1d6c8"
          opacity="0.95"
        />
        <path d="M80 30h13v49H80zM74 83h22v8H74z" fill="#fff8ef" />
      </svg>
    </div>
  )
}
