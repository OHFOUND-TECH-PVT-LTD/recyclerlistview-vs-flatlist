import { StatusBar } from "expo-status-bar";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from "react-native";

import FlatListTestComponent from "./FlatList";
import FlatList2 from "./FlatList2";
import RecycleTestComponent from "./RecyclerListView";
import RecyclerListView2 from "./RecyclerListView2";

export default function App() {
  const [listType, setListType] = useState(null);

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        handleBackButtonClick
      );
    };
  }, []);

  const handleBackButtonClick = () => {
    setListType(null);
    return true;
  };

  if (listType == "FlatList") {
    return <FlatListTestComponent />;
  }

  if (listType == "RecyclerListView") {
    return <RecycleTestComponent />;
  }

  if (listType == "FlatList2") {
    return <FlatList2 />;
  }

  if (listType == "RecyclerListView2") {
    return <RecyclerListView2 />;
  }

  if (!listType) {
    return (
      <View style={styles.container}>
        <Button
          onPress={() => {
            setListType("FlatList");
          }}
          title="FlatList"
        />
        <View>
          <Text>VS</Text>
        </View>
        <Button
          onPress={() => {
            setListType("RecyclerListView");
          }}
          title="RecyclerListView"
        />
        <StatusBar style="auto" />
        <View style={{ height: 50 }} />
        <Button
          onPress={() => {
            setListType("FlatList2");
          }}
          title="FlatList2"
        />
        <View>
          <Text>VS</Text>
        </View>
        <Button
          onPress={() => {
            setListType("RecyclerListView2");
          }}
          title="RecyclerListView2"
        />
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
