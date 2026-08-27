export const darkColors = {
  background: '#080B12',
  surface: '#151927',
  surfaceSecondary: '#111521',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  textMain: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#252D40',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  primary: '#6366F1', // keep brand primary
  primaryLight: '#818CF8',
  textMain: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

// Fallback legacy export (will be removed as files are updated, but kept so TS doesn't immediately crash everything)
export const colors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  md: 8,
  lg: 16,
  xl: 24,
};

// Factory function for styles
export const createGlobalStyles = (themeColors: typeof darkColors) => ({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  glassCard: {
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: themeColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 50,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    color: themeColors.textMain,
    marginLeft: spacing.sm,
    fontSize: 16,
  },
  button: {
    backgroundColor: themeColors.primary,
    height: 50,
    borderRadius: borderRadius.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: spacing.sm,
    flexDirection: 'row' as const,
  },
  buttonText: {
    color: '#ffffff', // Button text is always white on primary blue
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: spacing.sm,
  },
});

export const globalStyles = createGlobalStyles(colors);
