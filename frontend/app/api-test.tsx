import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { testChatAPI } from '@/utils/test-api';
import { logApiConfig } from '@/config';

export default function ApiTestScreen() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Log API configuration
      logApiConfig();
      
      // Run the test
      const result = await testChatAPI();
      setTestResult(result);
      
      if (!result.success) {
        setError('Test failed. See details below.');
      }
    } catch (e) {
      setError(`Unexpected error: ${e.message}`);
      setTestResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'API Test' }} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Chat API Test</Text>
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={runTest}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Run API Test'}
          </Text>
          {isLoading && (
            <ActivityIndicator 
              size="small" 
              color="#FFFFFF" 
              style={styles.loader} 
            />
          )}
        </TouchableOpacity>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {testResult && (
          <ScrollView style={styles.resultContainer}>
            <Text style={styles.resultTitle}>
              Test {testResult.success ? 'Succeeded' : 'Failed'}
            </Text>
            
            {testResult.success ? (
              <>
                <Text style={styles.sectionTitle}>Response:</Text>
                <Text style={styles.responseTime}>
                  Time taken: {testResult.response.time_taken || 'N/A'} seconds
                </Text>
                <Text style={styles.responseMessage}>
                  {testResult.response.message}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Error:</Text>
                <Text style={styles.errorDetails}>
                  {testResult.error?.message || 'Unknown error'}
                </Text>
                {testResult.error?.status && (
                  <Text style={styles.errorDetails}>
                    Status: {testResult.error.status}
                  </Text>
                )}
              </>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#F57C00',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginLeft: 10,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  errorText: {
    color: '#FF6B6B',
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: '#1D1E33',
    borderRadius: 8,
    padding: 15,
    maxHeight: 400,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
  },
  responseTime: {
    color: '#AAAAAA',
    marginBottom: 10,
  },
  responseMessage: {
    color: '#FFFFFF',
    lineHeight: 20,
  },
  errorDetails: {
    color: '#FF6B6B',
    marginBottom: 5,
  },
}); 