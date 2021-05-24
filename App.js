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
  Dimensions,
  Alert,
} from "react-native";

import FlatListViewWrapper from "./FlatList";
import FlatList2 from "./FlatList2";
import RecyclerListViewWrapper, { ViewTypes } from "./src/RecyclerListViewWrapper";
import RecyclerListView2 from "./RecyclerListView2";

let containerCount = 0;

class CellContainer extends React.Component {
  constructor(args) {
    super(args);
    this._containerId = containerCount++;
  }
  render() {
    return (
      <View {...this.props}>
        {this.props.children}
        <Text>Cell Id: {this._containerId}</Text>
      </View>
    );
  }
}

export default function App() {
  const [data, setData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [flag, setFlag] = useState(1);
  const [listType, setListType] = useState(null);
  let { width } = Dimensions.get("window");

  useEffect(() => {
    setData(_generateArray(300));
  }, []);

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

  const _generateArray = (n) => {
    let arr = new Array(n);
    for (let i = 0; i < n; i++) {
      arr[i] = i;
    }
    return arr;
  };

  if (listType == "FlatList") {
    return <FlatListViewWrapper />;
  }

  if (listType == "RecyclerListView") {
    return (
      <RecyclerListViewWrapper
        data={data}
        renderItem={({ item, index, type }) => (
          <CellContainer
            style={
              type === ViewTypes.HEADER ||
              type === ViewTypes.HEADER_WITH_SEPRATOR
                ? styles.containerGridLeft
                : type === ViewTypes.FOOTER
                ? styles.containerGridRight
                : styles.cellContainer
            }
          >
            <Text>Data: {item}</Text>
          </CellContainer>
        )}
        keyExtractor={(item, index) => `recycleListViewList-${index}`}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={() => (
          <Text style={{ color: "#000" }}>header</Text>
        )}
        ListFooterComponent={() => (
          <View>
            <TouchableOpacity
              onPress={() => {
                setData(_generateArray(data.length + 300));
              }}
            >
              <Text>Reload</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setFlag(flag + 1);
              }}
            >
              <Text>Re-Render</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => <Text style={{ color: "#000" }}>empty</Text>}
        ItemSeparatorComponent={() => (
          <Text style={{ color: "#000" }}>Seprate</Text>
        )}
        setElementDimensions={(type, index) => ({ width, height: 140 })}
        style={{ padding: 10 }}
        contentContainerStyle={{ borderWidth: 1 }}
        extraData={flag}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          setTimeout(() => {
            setRefreshing(false);
          }, 2000);
        }}
        onEndReached={() => {
          Alert.alert('end');
        }}
        onEndReachedThreshold={0}
      />
    );
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
  cellContainer: {
    justifyContent: "space-around",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#00a1f1",
  },
  containerGridLeft: {
    justifyContent: "space-around",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#ffbb00",
  },
  containerGridRight: {
    justifyContent: "space-around",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#7cbb00",
  },
});
