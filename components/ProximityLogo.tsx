import Svg, { Path, Circle } from 'react-native-svg'

// Open-bottomed rounded frame — sides splay outward at the bottom like opening doors
// Stroke center line; flared ends at (34,178) and (166,178)
const FRAME = "M 34 178 C 20 166 14 152 14 134 L 14 50 A 36 36 0 0 1 50 14 L 150 14 A 36 36 0 0 1 186 50 L 186 134 C 186 152 180 166 166 178"

export function ProximityLogo({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {/* White interior fill — keeps inside clean on any background */}
      <Path
        d="M 34 176 C 24 166 25 153 25 134 L 25 50 A 25 25 0 0 1 50 25 L 150 25 A 25 25 0 0 1 175 50 L 175 134 C 175 153 176 166 166 176 Z"
        fill="#FFFFFF"
      />

      {/* Left person — dark, behind */}
      <Circle cx={68} cy={100} r={15} fill="#12101C" />
      <Path d="M 30 180 C 28 158 38 124 68 118 C 82 122 86 156 83 180 Z" fill="#12101C" />

      {/* Right person — dark, behind */}
      <Circle cx={132} cy={100} r={15} fill="#12101C" />
      <Path d="M 117 180 C 114 156 118 122 132 118 C 162 124 172 158 170 180 Z" fill="#12101C" />

      {/* Center person — magenta, in front */}
      <Circle cx={100} cy={86} r={20} fill="#FF2D87" />
      <Path d="M 66 180 C 64 155 74 118 100 110 C 126 118 136 155 134 180 Z" fill="#FF2D87" />

      {/* Frame stroke — drawn last so it sits on top of figures at the edges */}
      <Path
        d={FRAME}
        fill="none"
        stroke="#12101C"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
