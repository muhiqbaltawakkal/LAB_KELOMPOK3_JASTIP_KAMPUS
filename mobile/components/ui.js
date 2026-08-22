import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, radius, spacing, typography } from "../theme/tokens";

export function AppButton({
  title,
  onPress,
  secondary = false,
  disabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const inactive = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={inactive}
      style={[
        styles.button,
        secondary ? styles.buttonSecondary : styles.buttonPrimary,
        inactive && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.text : "#FFFFFF"} />
      ) : (
        <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: colors.pink,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: typography.body,
    letterSpacing: 0.2,
  },
  buttonTextSecondary: {
    color: colors.text,
  },
});
