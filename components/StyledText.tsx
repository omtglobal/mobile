import { Text, TextProps } from './Themed';

export { Text };
export type { TextProps };

export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}
