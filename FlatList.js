/***
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import React, { Component } from "react";
import { View, Text, Dimensions, FlatList } from "react-native";

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
export default class RecycleTestComponent extends React.Component {
  constructor(args) {
    super(args);

    this._rowRenderer = this._rowRenderer.bind(this);

    //Since component should always render once data has changed, make data provider part of the state
    this.state = {
      dataProvider: this._generateArray(300),
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
            <Text>Data: {data}</Text>
          </CellContainer>
        );
      default:
        return null;
    }
  }

  render() {
    return (
      <FlatList
        data={this.state.dataProvider}
        keyExtractor={(item) => item.id}
        renderItem={this._rowRenderer}
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
