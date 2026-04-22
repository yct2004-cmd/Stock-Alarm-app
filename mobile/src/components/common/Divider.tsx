import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface DividerProps {
  indent?: number;
}

export default function Divider({ indent = 0 }: DividerProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.line, { backgroundColor: colors.separator, marginLeft: indent }]} />
  );
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth },
});
