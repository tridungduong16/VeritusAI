import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';

const TestMarkdownScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  const sampleMarkdown = `# Veritusa AI Test Response

## Introduction
This is a **sample response** from Veritusa AI to demonstrate *markdown formatting*.

### Features Available:
- Bullet point lists
- **Bold text** for emphasis
- *Italic text* for style
- \`Inline code\` snippets

### Code Block Example:
\`\`\`javascript
function greetUser(name) {
    return \`Hello, \${name}! Welcome to Veritusa AI.\`;
}

console.log(greetUser("User"));
\`\`\`

### Important Information:
> This is a blockquote to highlight important information or quotes from sources.

### News Sources:
1. **CNN** - Breaking news updates
2. **BBC** - International coverage  
3. **Reuters** - Financial news

---

**Conclusion:** The markdown rendering is working properly! ✅`;

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
    heading3: {
      color: '#FFF',
      fontFamily: 'Inter-Bold',
      fontSize: 18,
      marginTop: 6,
      marginBottom: 3,
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
    hr: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      height: 1,
      marginVertical: 8,
    },
    paragraph: {
      color: '#FFF',
      marginTop: 0,
      marginBottom: 8,
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
        <Text style={styles.title}>Bot Response Preview:</Text>
        <View style={styles.messageContainer}>
          <Markdown style={markdownStyles}>
            {sampleMarkdown}
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
    marginBottom: 10,
  },
  messageContainer: {
    backgroundColor: '#2A2B3D',
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
  },
});

export default TestMarkdownScreen; 