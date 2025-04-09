import React from 'react';
import { StyleSheet, TextInput, View, FlatList, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/lib/hooks/useThemeColor';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const inputBackground = useThemeColor({}, 'surfaceHighlight');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Search',
          headerShown: true,
        }} 
      />
      <ThemedView style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: inputBackground }]}>
            <IconSymbol name="magnifyingglass" size={20} color={placeholderColor} />
            <TextInput
              style={[styles.input, { color: textColor }]}
              placeholder="Search..."
              placeholderTextColor={placeholderColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol name="chevron.right" size={20} color={placeholderColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={[]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                {searchQuery.length > 0
                  ? 'Nothing found'
                  : 'Enter something to search'}
              </ThemedText>
            </View>
          }
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => <View />}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: 36,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    opacity: 0.6,
    fontSize: 16,
  },
}); 