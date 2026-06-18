import { useEffect } from "react"
import type { ViewStyle } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"

type Props = {
  width?: number | `${number}%`
  height: number
  borderRadius?: number
  style?: ViewStyle
}

export function Skeleton({ width = "100%", height, borderRadius = 8, style }: Props) {
  const opacity = useSharedValue(0.5)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.4, { duration: 600 })
      ),
      -1,
      false
    )
  }, [])

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: "#E8E5F0" }, animStyle, style]}
    />
  )
}
