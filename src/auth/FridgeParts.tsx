type DoorSide = 'left' | 'right'

type PantryItem = 'milk' | 'juice' | 'green' | 'jar' | 'butter' | 'berry' | 'water' | 'eggbox'

const DOOR_SHELVES: Record<DoorSide, PantryItem[][]> = {
  left: [
    ['milk', 'juice', 'jar'],
    ['green', 'berry'],
    ['butter', 'water'],
  ],
  right: [
    ['water', 'butter'],
    ['green', 'jar'],
    ['juice', 'eggbox'],
  ],
}

function DoorShelf({ items }: { items: PantryItem[] }) {
  return (
    <div className="door-shelf">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className={`door-item door-item--${item}`}>
          <span className="door-item-label" />
        </span>
      ))}
      <span className="door-shelf-lip" />
    </div>
  )
}

export function FridgeDoor({ side }: { side: DoorSide }) {
  return (
    <div className={`fridge-door fridge-door-${side}`}>
      <div className="door-face door-face-front">
        <span className="door-inset" aria-hidden="true" />
        <span className={`door-handle door-handle--${side}`} aria-hidden="true" />
        {side === 'left' && (
          <span className="fridge-temp" aria-hidden="true">
            <span className="fridge-temp-dot" />
            4°<span className="fridge-temp-unit">C</span>
          </span>
        )}
      </div>

      <div className="door-face door-face-back">
        <div className="door-inner-shelves">
          {DOOR_SHELVES[side].map((items, index) => (
            <DoorShelf key={index} items={items} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function FridgeTopShelf() {
  return (
    <div className="fridge-shelf-top" aria-hidden="true">
      <svg viewBox="0 0 528 132" preserveAspectRatio="xMidYMax meet" fill="none">
        <defs>
          <linearGradient id="lhc-milk" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFDF7" />
            <stop offset="0.55" stopColor="#F7F2E6" />
            <stop offset="1" stopColor="#E8E0CF" />
          </linearGradient>
          <linearGradient id="lhc-amber" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#EEC780" />
            <stop offset="0.55" stopColor="#E3B274" />
            <stop offset="1" stopColor="#CD9858" />
          </linearGradient>
          <linearGradient id="lhc-green" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#A5B38F" />
            <stop offset="0.6" stopColor="#91A07A" />
            <stop offset="1" stopColor="#768566" />
          </linearGradient>
          <linearGradient id="lhc-shelf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F4F2EA" />
            <stop offset="0.55" stopColor="#DDE4DD" />
            <stop offset="1" stopColor="#C3CEC5" />
          </linearGradient>
        </defs>

        <ellipse cx="55" cy="112" rx="23" ry="3.4" fill="#2D3028" opacity="0.11" />
        <ellipse cx="103" cy="112" rx="18" ry="3.2" fill="#2D3028" opacity="0.1" />
        <ellipse cx="143" cy="112" rx="16" ry="3" fill="#2D3028" opacity="0.1" />
        <ellipse cx="222" cy="112" rx="46" ry="3.4" fill="#2D3028" opacity="0.1" />
        <ellipse cx="336" cy="112" rx="45" ry="3.4" fill="#2D3028" opacity="0.1" />
        <ellipse cx="418" cy="112" rx="21" ry="3.2" fill="#2D3028" opacity="0.1" />
        <ellipse cx="477" cy="112" rx="20" ry="3" fill="#2D3028" opacity="0.1" />

        <g transform="translate(38 38)">
          <rect x="5" y="20" width="26" height="54" rx="8" fill="url(#lhc-milk)" stroke="#D8D1C2" strokeWidth="0.8" />
          <rect x="10" y="2" width="16" height="22" rx="4" fill="#FBF8F0" stroke="#D8D1C2" strokeWidth="0.8" />
          <rect x="9" y="0" width="18" height="7" rx="3" fill="#A8B49A" />
          <rect x="5" y="40" width="26" height="18" rx="3" fill="#EED99E" opacity="0.55" />
          <rect x="10" y="45" width="16" height="2" rx="1" fill="#6C654F" opacity="0.45" />
          <rect x="10" y="50" width="11" height="2" rx="1" fill="#6C654F" opacity="0.3" />
        </g>

        <g transform="translate(92 46)">
          <rect x="6" y="12" width="14" height="16" rx="4" fill="#E3B274" />
          <rect x="7" y="4" width="12" height="10" rx="3" fill="#F0C98E" />
          <rect x="6" y="0" width="14" height="6" rx="2" fill="#4A4E42" />
          <rect x="0" y="24" width="26" height="42" rx="7" fill="url(#lhc-amber)" stroke="#C89A5B" strokeWidth="0.8" />
          <rect x="3" y="42" width="20" height="14" rx="3" fill="#F8F5EE" opacity="0.9" />
          <circle cx="13" cy="49" r="3.6" fill="#EED99E" />
          <path d="M13 45.4v7.2M9.4 49h7.2" stroke="#D3A85B" strokeWidth="1.1" strokeLinecap="round" />
        </g>

        <g transform="translate(132 50)">
          <path d="M8 10h6v7l6 7v32a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6V24l6-7z" fill="url(#lhc-green)" stroke="#7E8E6A" strokeWidth="0.8" />
          <rect x="8" y="2" width="6" height="9" rx="2" fill="#62724F" />
          <rect x="6" y="0" width="10" height="4" rx="2" fill="#3E4537" />
          <rect x="4" y="39" width="14" height="12" rx="2" fill="#F4F0E4" opacity="0.88" />
          <path d="M7 44h8M7 47h5" stroke="#7D8267" strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
        </g>

        <g transform="translate(178 76)">
          <path d="M6 22 18 6h48l12 16v12H6Z" fill="#DCCCA8" />
          <path d="M6 22h72v12H6Z" fill="#CBB991" />
          <path d="M18 6h6l-6 16h-6zM42 6h6l-6 16h-6zM66 6h6l-6 16h-6z" fill="#E9DBBD" opacity="0.8" />
          <ellipse cx="21" cy="20" rx="9" ry="7" fill="#F7EBD4" />
          <ellipse cx="42" cy="19" rx="9" ry="7" fill="#F3E3C6" />
          <ellipse cx="63" cy="20" rx="9" ry="7" fill="#F8EFDD" />
        </g>

        <g transform="translate(292 72)">
          <path d="M0 18h88c-4 15-20 22-44 22S4 33 0 18Z" fill="#A8B49A" />
          <path d="M0 18h88v5H0z" fill="#92A083" />
          <circle cx="25" cy="12" r="12" fill="#E87559" />
          <circle cx="49" cy="9" r="10" fill="#EED99E" />
          <circle cx="68" cy="14" r="8" fill="#B9C5AC" />
          <path d="M53 4c4-6 10-6 12-4-3 5-7 6-12 4Z" fill="#7E8F6C" />
          <circle cx="21" cy="7" r="2.4" fill="#F7E4D8" opacity="0.7" />
        </g>

        <g transform="translate(400 58)">
          <rect x="0" y="12" width="36" height="42" rx="7" fill="#F0E3C2" stroke="#D6C6A3" strokeWidth="0.8" />
          <rect x="-2" y="6" width="40" height="10" rx="4" fill="#7B8B69" />
          <rect x="4" y="0" width="32" height="8" rx="3" fill="#96A583" />
          <rect x="6" y="26" width="24" height="16" rx="3" fill="#FFFDF8" opacity="0.8" />
          <path d="M11 33h14M11 37h9" stroke="#A98F62" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
        </g>

        <g transform="translate(456 46)">
          <path d="M14 64V26M22 64V18M30 64V28" stroke="#71825F" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="9" cy="30" rx="7" ry="4" transform="rotate(-35 9 30)" fill="#8FA47C" />
          <ellipse cx="17" cy="24" rx="6" ry="3.6" transform="rotate(28 17 24)" fill="#9DAF89" />
          <ellipse cx="28" cy="34" rx="7" ry="4" transform="rotate(38 28 34)" fill="#839672" />
          <ellipse cx="36" cy="25" rx="6" ry="3.4" transform="rotate(-24 36 25)" fill="#99AA86" />
          <rect x="4" y="54" width="34" height="12" rx="4" fill="#CAD4BE" stroke="#A9B79C" strokeWidth="0.8" />
          <path d="M9 60h24" stroke="#A9B79C" strokeWidth="1.3" strokeLinecap="round" />
        </g>

        <rect x="14" y="112" width="500" height="9" rx="4.5" fill="url(#lhc-shelf)" />
        <rect x="22" y="113" width="484" height="3" rx="1.5" fill="#FFFFFF" opacity="0.72" />
        <rect x="20" y="121" width="488" height="2" rx="1" fill="#2D3028" opacity="0.12" />
        <rect x="42" y="127" width="444" height="2" rx="1" fill="#EED99E" opacity="0.42" />
      </svg>
    </div>
  )
}

export function FridgeCrisperBottom() {
  return (
    <div className="fridge-crisper-bottom" aria-hidden="true">
      <svg viewBox="0 0 528 96" preserveAspectRatio="xMidYMax meet" fill="none">
        <defs>
          <linearGradient id="lhc-crisper-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EFF3EB" stopOpacity="0.5" />
            <stop offset="1" stopColor="#D3DFCB" stopOpacity="0.92" />
          </linearGradient>
          <linearGradient id="lhc-crisper-rail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F4F3EB" />
            <stop offset="1" stopColor="#CAD4C8" />
          </linearGradient>
        </defs>

        <rect x="16" y="2" width="496" height="6" rx="3" fill="url(#lhc-crisper-rail)" />
        <rect x="24" y="3" width="480" height="2" rx="1" fill="#FFFFFF" opacity="0.8" />

        <g transform="translate(20 8)">
          <g>
            <circle cx="34" cy="18" r="12" fill="#6F8259" />
            <circle cx="49" cy="12" r="9" fill="#7D9066" />
            <circle cx="60" cy="20" r="11" fill="#687D53" />
            <circle cx="43" cy="27" r="10" fill="#7B8E64" />
            <circle cx="54" cy="14" r="4" fill="#93A47C" opacity="0.7" />
            <path d="M38 30v8M53 28v9" stroke="#A9B99A" strokeWidth="3" strokeLinecap="round" />
          </g>
          <g>
            <path d="M108 18c4-3 8-3 12 0l-6 24z" fill="#D98A54" />
            <path d="M129 14c4-3 8-3 12 0l-6 27z" fill="#CE7C48" />
            <path d="M150 20c4-3 8-3 12 0l-6 22z" fill="#E09A63" />
            <path d="M112 19c-4-7-1-12 2-13 3 5 2 10-2 13ZM133 15c-4-7-1-11 2-12 3 5 2 9-2 12ZM154 21c-4-6-1-10 2-11 3 4 2 8-2 11Z" fill="#73855F" />
          </g>
          <g>
            <circle cx="190" cy="28" r="9" fill="#E87559" />
            <circle cx="208" cy="24" r="8" fill="#DE6A4E" />
            <circle cx="201" cy="35" r="7" fill="#EC8267" />
            <path d="M188 20c2-4 5-5 7-5-1 4-3 6-7 5Z" fill="#7E8F6C" />
            <circle cx="187" cy="25" r="2" fill="#F9D9CF" opacity="0.7" />
          </g>
          <rect x="0" y="26" width="238" height="58" rx="13" fill="url(#lhc-crisper-glass)" stroke="#B4C2AB" strokeWidth="1" />
          <rect x="8" y="30" width="222" height="9" rx="4.5" fill="#FFFFFF" opacity="0.3" />
          <rect x="88" y="34" width="62" height="6" rx="3" fill="#E9EDE2" opacity="0.9" stroke="#AEBDA4" strokeWidth="0.8" />
          <text x="18" y="74" fill="#2D3028" fillOpacity="0.42" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="7" fontWeight="700" letterSpacing="2">
            SAYUR
          </text>
          <text x="180" y="74" fill="#2D3028" fillOpacity="0.3" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="6" fontWeight="600" letterSpacing="1.4">
            FRESH
          </text>
        </g>

        <g transform="translate(270 8)">
          <g>
            <circle cx="38" cy="20" r="13" fill="#E87559" />
            <circle cx="39" cy="16" r="4" fill="#F19A85" opacity="0.65" />
            <circle cx="64" cy="16" r="11" fill="#EED99E" />
            <circle cx="64" cy="15" r="3.4" fill="#F8EBC4" opacity="0.8" />
            <circle cx="86" cy="23" r="12" fill="#D9B66C" />
            <circle cx="112" cy="25" r="10" fill="#E6C57C" />
            <path d="M36 8c1-4 4-6 7-6-1 4-3 6-7 6ZM62 5c1-4 4-5 7-5-1 4-3 5-7 5Z" fill="#71825F" />
          </g>
          <g>
            <path d="M142 36c-5-6-4-16 1-23 6 5 8 14 3 22z" fill="#A8B49A" />
            <path d="M154 35c-3-8 0-16 6-20 4 7 2 15-4 20z" fill="#93A184" />
            <path d="M163 39c-1-6 3-11 7-13 2 5-1 10-5 13z" fill="#B3BFA3" />
            <circle cx="178" cy="30" r="7" fill="#E87559" />
          </g>
          <rect x="0" y="26" width="238" height="58" rx="13" fill="url(#lhc-crisper-glass)" stroke="#B4C2AB" strokeWidth="1" />
          <rect x="8" y="30" width="222" height="9" rx="4.5" fill="#FFFFFF" opacity="0.3" />
          <rect x="88" y="34" width="62" height="6" rx="3" fill="#E9EDE2" opacity="0.9" stroke="#AEBDA4" strokeWidth="0.8" />
          <text x="18" y="74" fill="#2D3028" fillOpacity="0.42" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="7" fontWeight="700" letterSpacing="2">
            BUAH
          </text>
          <text x="178" y="74" fill="#2D3028" fillOpacity="0.3" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="6" fontWeight="600" letterSpacing="1.4">
            COLD
          </text>
        </g>
      </svg>
    </div>
  )
}
