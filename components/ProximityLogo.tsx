import Svg, { Path, Circle } from 'react-native-svg'

const BORDER = "M 44 8 H 156 A 36 36 0 0 1 192 44 V 156 A 36 36 0 0 1 156 192 H 122 A 22 22 0 0 0 78 192 H 44 A 36 36 0 0 1 8 156 V 44 A 36 36 0 0 1 44 8 Z"

export function ProximityLogo({ size = 120 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {/* White background fill */}
      <Path d={BORDER} fill="#FFFFFF" />

      {/* Left person — dark, behind */}
      <Circle cx={60} cy={75} r={18} fill="#12101C" />
      <Path d="M 24 165 A 36 72 0 0 0 96 165 L 96 200 L 24 200 Z" fill="#12101C" />

      {/* Right person — dark, behind */}
      <Circle cx={140} cy={75} r={18} fill="#12101C" />
      <Path d="M 104 165 A 36 72 0 0 0 176 165 L 176 200 L 104 200 Z" fill="#12101C" />

      {/* Center person — magenta, in front */}
      <Circle cx={100} cy={64} r={22} fill="#FF2D87" />
      <Path d="M 58 165 A 42 79 0 0 0 142 165 L 142 200 L 58 200 Z" fill="#FF2D87" />

      {/* Border stroke on top — clips overflow and draws the arch notch */}
      <Path d={BORDER} fill="none" stroke="#12101C" strokeWidth="9" strokeLinejoin="round" />
    </Svg>
  )
}
