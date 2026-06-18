import * as ExpoHaptics from "expo-haptics"

const noop = () => {}
function safe(fn: () => Promise<void>) {
  return () => { fn().catch(noop) }
}

export const haptic = {
  light:     safe(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light)),
  medium:    safe(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium)),
  heavy:     safe(() => ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy)),
  selection: safe(() => ExpoHaptics.selectionAsync()),
  success:   safe(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success)),
  error:     safe(() => ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error)),
}
