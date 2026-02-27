import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../navigation/types';

type LegalRouteProp = RouteProp<RootStackParamList, 'LegalDocument'>;
type Section = { heading?: string; lines: string[] };

export const LegalDocumentScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<LegalRouteProp>();
  const { title, content } = route.params;
  const sections = content
    .split('\n\n')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
      const firstLine = lines[0] ?? '';
      const isHeading =
        /^\d+\./.test(firstLine) ||
        [
          'Information We Do Not Directly Collect',
          'Exchange Rate Requests',
          'Subscription & Payment Processing',
          'Analytics & Usage Data',
          'Log Data',
          'Cookies & Similar Technologies',
          'Service Providers',
          'Security',
          'Children’s Privacy',
          'Changes to This Policy',
          'Contact',
        ].includes(firstLine);

      if (isHeading) {
        return { heading: firstLine, lines: lines.slice(1) } as Section;
      }

      return { lines } as Section;
    });

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {sections.map((section, index) => (
          <View
            key={`${section.heading ?? 'p'}-${index}`}
            style={[
              styles.section,
              !section.heading && section.lines.length === 1 ? styles.compactSection : null,
            ]}
          >
            {section.heading ? (
              <Text style={[styles.sectionHeading, { color: colors.text }]}>{section.heading}</Text>
            ) : null}
            {section.lines.map((line, lineIndex) => {
              const isBullet = !section.heading && line.length > 0;
              return (
                <Text
                  key={`${index}-${lineIndex}`}
                  style={[styles.content, { color: colors.textSecondary }]}
                >
                  {isBullet ? `• ${line}` : line}
                </Text>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 80,
  },
  backText: {
    fontSize: 17,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 18,
  },
  compactSection: {
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 2,
  },
});
