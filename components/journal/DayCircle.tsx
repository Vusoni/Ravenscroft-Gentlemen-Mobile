// components/journal/DayCircle.tsx
import { Pressable, StyleSheet, Text, View } from 'react-native';

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function DayCircle({
  date,
  dayIndex,
  isSelected,
  isToday,
  onPress,
}: {
  date: Date;
  dayIndex: number;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.dayCol}>
      <Text style={[styles.dayLetter, isSelected && styles.dayLetterActive]}>
        {DAY_LETTERS[dayIndex]}
      </Text>
      <View
        style={[
          styles.dayCircle,
          isSelected && styles.dayCircleActive,
          !isSelected && isToday && styles.dayCircleToday,
        ]}
      >
        <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
          {date.getDate()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dayCol: { alignItems: 'center', gap: 6 },
  dayLetter: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    color: '#ABABAB',
  },
  dayLetterActive: { color: '#0A0A0A' },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  dayCircleActive: { backgroundColor: '#0A0A0A' },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: '#0A0A0A',
    backgroundColor: 'transparent',
  },
  dayNumber: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#1C1C1C',
  },
  dayNumberActive: { color: '#EDEDED' },
});
