import { Pressable, Text, StyleSheet } from 'react-native';

export type ThemedButtonProps = {
  title: string;
  onPress: () => void;
  textStyle?: object;
  buttonStyle?: object;
};

export function ThemedButton({
  title,
  onPress,
  textStyle,
  buttonStyle,
}: ThemedButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        buttonStyle,
      ]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0077b6', 
    paddingVertical: 8, 
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: '#005BB5',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.75,
  },
});