/***
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import React, { Component } from "react";
import {
  View,
  Text,
  Dimensions,
  FlatList,
  Button,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";

const ViewTypes = {
  FULL: 0,
  HALF_LEFT: 1,
  HALF_RIGHT: 2,
};

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

/***
 * To test out just copy this component and render in you root component
 */
export default class FlatListViewWrapper extends React.Component {
  constructor(args) {
    super(args);

    this._rowRenderer = this._rowRenderer.bind(this);

    //Since component should always render once data has changed, make data provider part of the state
    this.state = {
      dataProvider: this._generateArray(300),
      refreshing: false,
    };
  }

  _generateArray(n) {
    let arr = new Array(n);
    let { width } = Dimensions.get("window");
    for (let i = 0; i < n; i++) {
      // define type
      let type = ViewTypes.HALF_RIGHT;
      if (i % 3 === 0) {
        type = ViewTypes.FULL;
      } else if (i % 3 === 1) {
        type = ViewTypes.HALF_LEFT;
      }

      // define width/height
      let _width = width;
      let _height = 140;
      //   if (type === ViewTypes.HALF_LEFT) {
      //     _width = width / 2;
      //     _height = 160;
      //   } else if (type === ViewTypes.HALF_RIGHT) {
      //     _width = width / 2;
      //     _height = 160;
      //   } else if (type === ViewTypes.FULL) {
      //     _width = width;
      //     _height = 140;
      //   }
      arr[i] = {
        id: `flatlist-${i}`,
        type,
        data: i,
        width: _width,
        height: _height,
      };
    }
    return arr;
  }

  //Given type and data return the view component
  _rowRenderer({ item: { type, data, width, height } }) {
    //You can return any view here, CellContainer has no special significance
    switch (type) {
      case ViewTypes.HALF_LEFT:
        return (
          <CellContainer style={[styles.containerGridLeft, { width, height }]}>
            <Text>Data: {data}</Text>
          </CellContainer>
        );
      case ViewTypes.HALF_RIGHT:
        return (
          <CellContainer style={[styles.containerGridRight, { width, height }]}>
            <Text>Data: {data}</Text>
          </CellContainer>
        );
      case ViewTypes.FULL:
        return (
          <CellContainer style={[styles.container, { width, height }]}>
            <TextInput
              placeholder="Search States"
              autoCorrect={false}
              clearButtonMode="always"
              autoCapitalize="none"
              backgroundColor={"#fff"}
            />
            <Button
              title="Submit"
              color={"#000"}
              onPress={() => {
                Alert.alert(`${data}`);
              }}
            />
          </CellContainer>
        );
      default:
        return null;
    }
  }

  setRefreshing(flag) {
    this.setState({
      refreshing: flag,
    });
  }

  setData(data) {
    this.setState({
      dataProvider: data,
    });
  }

  setFlag(flag) {
    this.setState({
      flag,
    });
  }

  render() {
    return (
      <FlatList
        ListHeaderComponent={() => <Text>header</Text>}
        ListFooterComponent={() => (
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => {
               this. setData(this._generateArray(this.state.dataProvider.length + 300));
              }}
            >
              <Text>Reload</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.setFlag(this.state.flag + 1);
              }}
            >
              <Text>Re-Render</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>empty</Text>}
        ItemSeparatorComponent={() => <Text>Seprate</Text>}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        data={this.state.dataProvider}
        keyExtractor={(item) => item.id}
        renderItem={this._rowRenderer}
        style={{ padding: 10 }}
        contentContainerStyle={{ borderWidth: 1 }}
        extraData={this.state.flag}
        refreshing={this.state.refreshing}
        onRefresh={() => {
          this.setRefreshing(true);
          setTimeout(() => {
            this.setRefreshing(false);
          }, 2000);
        }}
        onEndReached={() => {
          Alert.alert("end");
        }}
        onEndReachedThreshold={0}
      />
    );
  }
}
const styles = {
  container: {
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#00a1f1",
    flex: 1,
  },
  containerGridLeft: {
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffbb00",
    flex: 1,
  },
  containerGridRight: {
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#7cbb00",
    flex: 1,
  },
};
