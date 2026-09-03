import type { SVGProps } from 'react'

/**
 * Inline SVG icon set — no emoji anywhere on the site.
 *
 * Emoji render differently on every platform and cannot be recoloured; these
 * inherit `currentColor` and size to `1em`, so they take on the colour and
 * scale of whatever text they sit beside.
 *
 * Convention: 24x24 viewBox, 1.75 stroke width, round caps and joins.
 */

type IconProps = Omit<SVGProps<SVGSVGElement>, 'size'> & {
  size?: string | number
  title?: string
}

function Svg({ size = '1em', title, children, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

export const ArrowLeft = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M19.5 12h-15" />
    <path d="M10.6 5.8 4.5 12l6.1 6.2" />
  </Svg>
)

export const ArrowRight = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M4.5 12h15" />
    <path d="m13.4 5.8 6.1 6.2-6.1 6.2" />
  </Svg>
)

export const ChevronDown = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="m5.6 9 6.4 6.4L18.4 9" />
  </Svg>
)

export const Briefcase = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.8" y="7.4" width="18.4" height="12.4" rx="2.2" />
    <path d="M8.6 7.4V5.8A1.8 1.8 0 0 1 10.4 4h3.2a1.8 1.8 0 0 1 1.8 1.8v1.6" />
    <path d="M2.8 12.6h18.4" />
    <path d="M10.4 12.6h3.2" />
  </Svg>
)

export const Building = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20.4V5.6A1.6 1.6 0 0 1 5.6 4h7.2a1.6 1.6 0 0 1 1.6 1.6v14.8" />
    <path d="M14.4 10.4h4A1.6 1.6 0 0 1 20 12v8.4" />
    <path d="M2.6 20.4h18.8" />
    <path d="M7.4 8h3.6M7.4 11.6h3.6M7.4 15.2h3.6" />
  </Svg>
)

export const MapPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21c4-4.4 6-7.7 6-10a6 6 0 1 0-12 0c0 2.3 2 5.6 6 10Z" />
    <circle cx="12" cy="11" r="2.4" />
  </Svg>
)

export const CalendarClock = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 11V7.4a1.8 1.8 0 0 0-1.8-1.8H5.8A1.8 1.8 0 0 0 4 7.4v10.4a1.8 1.8 0 0 0 1.8 1.8h5.4" />
    <path d="M8 3.4v3.6M16 3.4v3.6M4 10.2h16" />
    <circle cx="17.2" cy="16.8" r="4" />
    <path d="M17.2 15.2v1.8l1.2.8" />
  </Svg>
)

export const Search = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.8" cy="10.8" r="6.4" />
    <path d="m15.6 15.6 4.2 4.2" />
  </Svg>
)

export const GraduationCap = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4 2.5 8.6 12 13.2l9.5-4.6L12 4Z" />
    <path d="M6.5 10.7v4.6c0 1.5 2.5 2.9 5.5 2.9s5.5-1.4 5.5-2.9v-4.6" />
    <path d="M21.5 8.6v5.1" />
  </Svg>
)

export const GlobeAfrica = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.2 4.6c-.6 1.6.2 2.6 1.6 2.9 1.5.3 1.8 1.3 1 2.4-.9 1.2-.5 2.4.8 2.7 1.4.3 1.7 1.4 1 2.6-.5.9-.4 1.9.4 2.9" />
    <path d="M3.4 10.2c1.5.5 2.6.2 3.3-.9" />
  </Svg>
)

export const GlobeGrid = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.4 3.8 5.4 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.4-3.8-9S9.5 5.4 12 3Z" />
  </Svg>
)

export const Robot = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="8" width="16" height="11" rx="3" />
    <path d="M12 8V5" />
    <circle cx="12" cy="3.6" r="1.3" />
    <path d="M2.6 12.5v2.6M21.4 12.5v2.6" />
    <circle cx="9.2" cy="13" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="14.8" cy="13" r="1.1" fill="currentColor" stroke="none" />
  </Svg>
)

export const Document = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13.6 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.4L13.6 3Z" />
    <path d="M13.4 3.2v5.2h5.3" />
    <path d="M8.6 13h6.8M8.6 16.4h4.6" />
  </Svg>
)

export const Envelope = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.8" y="5.2" width="18.4" height="13.6" rx="2.4" />
    <path d="m3.4 7 7.5 5.4a2 2 0 0 0 2.2 0L20.6 7" />
  </Svg>
)

export const Star = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3.6 2.7 5.6 6 .9-4.4 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.3 10.1l6-.9L12 3.6Z" />
  </Svg>
)

/** Award medal — Student Leader applications. */
export const Medal = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="15" r="5.4" />
    <path d="m12 12.8.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3.9-1.9Z" />
    <path d="M8.6 9.6 6.2 3.2h11.6l-2.4 6.4" />
  </Svg>
)

export const Mailbox = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 11a4.4 4.4 0 0 1 8.8 0v7H3v-7Z" />
    <path d="M11.8 18h7.6a1.6 1.6 0 0 0 1.6-1.6V11a4.4 4.4 0 0 0-4.4-4.4h-9" />
    <path d="M6 11.6h3.2" />
    <path d="M18 6.6V3.4h-3.4" />
  </Svg>
)

export const Bell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 9a6 6 0 1 0-12 0c0 4.3-1.4 6-2.2 6.8a.7.7 0 0 0 .5 1.2h15.4a.7.7 0 0 0 .5-1.2C19.4 15 18 13.3 18 9Z" />
    <path d="M10 20.2a2.3 2.3 0 0 0 4 0" />
  </Svg>
)

export const Books = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.6" y="4" width="5.2" height="16" rx="1.2" />
    <rect x="10.2" y="4" width="5.2" height="16" rx="1.2" />
    <path d="m17.4 6.4 2.2-.6a1.2 1.2 0 0 1 1.5.85l2.1 10.2" />
    <path d="M6.2 8.4v3.2M12.8 8.4v3.2" />
  </Svg>
)

export const LinkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 13.8a4 4 0 0 0 5.7 0l2.9-2.9a4 4 0 0 0-5.7-5.7l-1.5 1.5" />
    <path d="M14 10.2a4 4 0 0 0-5.7 0l-2.9 2.9a4 4 0 0 0 5.7 5.7l1.5-1.5" />
  </Svg>
)

export const Stopwatch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="13.6" r="6.8" />
    <path d="M12 10.4v3.2l2.2 1.4" />
    <path d="M9.6 2.8h4.8" />
    <path d="m18.6 6.6 1.6-1.6" />
  </Svg>
)

export const Frustrated = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.4 16.4c.9-1.1 2.1-1.7 3.6-1.7s2.7.6 3.6 1.7" />
    <path d="M7.4 8.6 10 10.2 7.4 11.6M16.6 8.6 14 10.2l2.6 1.4" />
  </Svg>
)

export const Check = (p: IconProps) => (
  <Svg strokeWidth={2.4} {...p}>
    <path d="m4.8 12.6 4.6 4.6L19.2 7.4" />
  </Svg>
)

export const Close = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
)

export const Menu = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
)

export const CircleOutline = (p: IconProps) => (
  <Svg strokeWidth={2} {...p}>
    <circle cx="12" cy="12" r="6.4" />
  </Svg>
)

export const Dot = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />
  </Svg>
)

export const Seedling = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21v-8.4" />
    <path d="M12 12.6C9.4 11.4 6.6 9 6.6 6.2c0-1.4.9-2.4 2.2-2.4 2.2 0 3.2 4.4 3.2 8.8Z" />
    <path d="M12 11.2c2.2-2.2 5-3.6 6.6-3 1.2.5 1.2 2.3-.2 3.5-1.5 1.3-4.4 1.1-6.4-.5Z" />
    <path d="M8.6 21h6.8" />
  </Svg>
)

export const Rocket = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.6c3 2.2 4.6 5.3 4.6 9.2L14.4 16H9.6L7.4 11.8c0-3.9 1.6-7 4.6-9.2Z" />
    <circle cx="12" cy="10" r="1.9" />
    <path d="M9.6 16 8 20l3-1.6M14.4 16l1.6 4-3-1.6" />
  </Svg>
)

export const AlarmClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="13.2" r="7.2" />
    <path d="M12 9.6v3.6l2.4 1.6" />
    <path d="M4.6 4.6 2.4 6.6M19.4 4.6l2.2 2" />
  </Svg>
)

export const Instagram = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="16.9" cy="7.1" r="1.05" fill="currentColor" stroke="none" />
  </Svg>
)

export const XTwitter = ({ size = '1em', title, ...rest }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    role={title ? 'img' : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    focusable="false"
    {...rest}
  >
    {title ? <title>{title}</title> : null}
    <path d="M17.7 3h3.3l-7.2 8.2L22.3 21h-6.6l-5.2-6.7L4.6 21H1.3l7.7-8.8L1.7 3h6.8l4.7 6.2L17.7 3Zm-1.2 16h1.8L7.6 4.8H5.7L16.5 19Z" />
  </svg>
)

export const LinkedIn = ({ size = '1em', title, ...rest }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    role={title ? 'img' : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    focusable="false"
    {...rest}
  >
    {title ? <title>{title}</title> : null}
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.2h4V21H3V9.2Zm6.5 0h3.8v1.6h.06a4.2 4.2 0 0 1 3.77-2.07c4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.35c0-1.28-.02-2.92-1.78-2.92-1.78 0-2.05 1.39-2.05 2.83V21h-4V9.2Z" />
  </svg>
)
