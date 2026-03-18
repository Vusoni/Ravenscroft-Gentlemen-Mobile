// components/auth/AuthDivider.tsx
// The "or" divider row with two hairlines used between OAuth and email/password forms.
import { StyleSheet, Text, View } from 'react-native';

export function AuthDivider() {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>or</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D4D4D4',
  },
  label: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#ABABAB',
    letterSpacing: 0.5,
  },
});
