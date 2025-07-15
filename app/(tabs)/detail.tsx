import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function DetailScreen() {
  // You can access parameters passed during navigation like this:
  // const params = useLocalSearchParams();
  // const cardData = params.data ? JSON.parse(params.data as string) : null;

  // Random-like data for demonstration
  const person = {
    name: 'Alice',
    age: 30,
    location: 'Wonderland',
    pets: [
      { type: 'Cat', name: 'Cheshire', breed: 'Unknown' },
      { type: 'Rabbit', name: 'White Rabbit', breed: 'Flemish Giant' },
    ],
    bio: 'Loves exploring new places and spending time with my furry (and not so furry) friends.',
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ThemedText type="title">{person.name}'s Profile</ThemedText>
        <ThemedText>Age: {person.age}</ThemedText>
        <ThemedText>Location: {person.location}</ThemedText>
        <ThemedText style={styles.bio}>{person.bio}</ThemedText>

        <ThemedText type="subtitle" style={styles.petsTitle}>Pets:</ThemedText>
        {person.pets.map((pet, index) => (
          <ThemedView key={index} style={styles.petContainer}>
            <ThemedText>Type: {pet.type}</ThemedText>
            <ThemedText>Name: {pet.name}</ThemedText>
            <ThemedText>Breed: {pet.breed}</ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  bio: {
    marginTop: 10,
    marginBottom: 15,
  },
  petsTitle: {
    marginTop: 10,
    marginBottom: 5,
  },
  petContainer: {
    backgroundColor: '#333', // Example background for pet info
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
