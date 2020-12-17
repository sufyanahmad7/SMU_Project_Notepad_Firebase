import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import firebase from "../database/firebaseDB";
// LogBox.ignoreLogs(["Setting a timer"]);

export default function NotesScreen({ navigation, route }) 
{
  const [notes, setNotes] = useState([]);
  const db = firebase.firestore().collection("todos");

  // Load Firebase on start.
  // The snapshot keeps everything synced - no need to refresh it later.
  useEffect(() => 
  {
    // This function is run whenever todos changes.
    const unsubscribe = db.orderBy("created").onSnapshot((collection) => // Get a snapshot of this collection.
    {
      const updatedNotes = collection.docs.map((doc) =>
      {
        // Create our own object that pulls the id into a property.
        const noteObject =
        {
          ...doc.data(),
          id: doc.id,
        };
        console.log(noteObject);
        return noteObject;
      });

      // const updatedNotes = collection.docs.map((doc) => doc.data());
      // console.log(updatedNotes);
      setNotes(updatedNotes); // And set our notes state array to its docs.
    });
    
    // Unsubscribe when unmounting.
    // return unsubscribe();
    return () => 
    { 
      unsubscribe();
    };
  }, []);

  // This is to set up the top right button
  useEffect(() => 
  {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={addNote}>
          <Ionicons
            name="ios-create-outline"
            size={30}
            color="black"
            style={{
              color: "#f55",
              marginRight: 10,
            }}
          />
        </TouchableOpacity>
      ),
    });
  });

  // Monitor route.params for changes and add items to the database
  useEffect(() => 
  {
    if (route.params?.text) 
    {
      const newNote = {
        title: route.params.text,
        done: false,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        // An alternative will be: created: Date.now().toString(),
      };
      db.add(newNote); // Creates an item newNote with the properties.
      console.log(newNote);

      // Reset the params which contains the previous text.
      route.params.text = "";
    }
  }, [route.params?.text]);

  function addNote() 
  {
    navigation.navigate("Add Screen");
  }

  // This deletes an individual note
  function deleteNote(id) 
  {
    console.log("Deleting " + id);
    // To delete that item, we filter out the item we don't want.
    // .get fetches a snapshot of the id.
    // This is much simpler now that we have the Firestore id.
    db.doc(id).delete();
  }

  // The function to render each row in our FlatList
  function renderItem({ item }) 
  {
    return (
      <View
        style=
        {{
          padding: 10,
          paddingTop: 20,
          paddingBottom: 20,
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
        >
        <Text>{item.title}</Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <Ionicons name="trash" size={16} color="#944" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderItem}
        style={{ width: "100%" }}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: 
  {
    flex: 1,
    backgroundColor: "#ffc",
    alignItems: "center",
    justifyContent: "center",
  },
});
