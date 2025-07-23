import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';

const MarkdownTestScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  const testMarkdown = `# Markdown Test

This is a **bold text** and *italic text*.

## Lists
- Item 1
- Item 2
- Item 3

1. First item
2. Second item
3. Third item

## Code
Inline \`code\` example

\`\`\`
function test() {
  console.log("Hello world!");
}
\`\`\`

## Blockquote
> This is a blockquote
> Multiple lines

## Links
[Example Link](https://example.com)

## Table
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;

  const markdownStyles = {
    body: {
      color: '#FFF',
      fontFamily: 'Inter-Regular',
      fontSize: 16,
    },
    heading1: {
      color: '#FFF',
      fontFamily: 'Inter-Bold',
      fontSize: 22,
      marginTop: 8,
      marginBottom: 4,
    },
    heading2: {
      color: '#FFF',
      fontFamily: 'Inter-Bold',
      fontSize: 20,
      marginTop: 8,
      marginBottom: 4,
    },
    text: {
      color: '#FFF',
      fontFamily: 'Inter-Regular',
      fontSize: 16,
    },
    strong: {
      color: '#FFF',
      fontWeight: 'bold',
    },
    em: {
      color: '#FFF',
      fontStyle: 'italic',
    },
    link: {
      color: '#F57C00',
      textDecorationLine: 'underline',
    },
    blockquote: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderLeftWidth: 4,
      borderLeftColor: '#F57C00',
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginVertical: 4,
    },
    code_inline: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFF',
      fontFamily: 'monospace',
      borderRadius: 4,
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    code_block: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      padding: 8,
      borderRadius: 4,
      fontFamily: 'monospace',
      color: '#FFF',
      marginVertical: 8,
    },
    fence: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      padding: 8,
      borderRadius: 4,
      fontFamily: 'monospace',
      color: '#FFF',
      marginVertical: 8,
    },
    bullet_list: {
      color: '#FFF',
    },
    ordered_list: {
      color: '#FFF',
    },
    list_item: {
      color: '#FFF',
      marginBottom: 4,
    },
    bullet_list_icon: {
      color: '#F57C00',
    },
    ordered_list_icon: {
      color: '#F57C00',
    },
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen 
        options={{ 
          title: 'Markdown Test',
          headerStyle: { backgroundColor: '#1D1E33' },
          headerTintColor: '#FFF',
        }} 
      />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Raw Markdown:</Text>
        <Text style={styles.rawText}>{testMarkdown}</Text>
        
        <Text style={styles.title}>Rendered Markdown:</Text>
        <View style={styles.markdownContainer}>
          <Markdown style={markdownStyles}>
            {testMarkdown}
          </Markdown>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  rawText: {
    color: '#CCC',
    fontFamily: 'monospace',
    backgroundColor: '#2A2B3D',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  markdownContainer: {
    backgroundColor: '#2A2B3D',
    padding: 12,
    borderRadius: 8,
  },
});

export default MarkdownTestScreen; 