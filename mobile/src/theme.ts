export const colors = {
  background: '#0b0f19',
  surface: '#1a1f2e',
  surfaceGlass: 'rgba(26, 31, 46, 0.7)',
  primary: '#6366f1',
  primaryHover: '#4f46e5',
  secondary: '#10b981',
  textMain: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#334155',
  borderGlass: 'rgba(51, 65, 85, 0.5)',
  error: '#ef4444',
};

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

// Global base styles that mimic the Web glassmorphism
export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  glassCard: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 50,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.textMain,
    marginLeft: spacing.sm,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: borderRadius.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: spacing.sm,
    flexDirection: 'row' as const,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: spacing.sm,
  },
};
