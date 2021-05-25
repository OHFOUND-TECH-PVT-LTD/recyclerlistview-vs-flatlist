/***
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import React, { Component } from "react";
import {
  View,
  Text,
  Dimensions,
  TextInput,
  Button,
  Alert,
  RefreshControl,
} from "react-native";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from "recyclerlistview"; // 1.1.0

const ViewTypes = {
  FULL: 0,
  FULL_WITH_SEPRATOR: 1,
  HEADER: 2,
  HEADER_WITH_SEPRATOR: 3,
  FOOTER: 4,
  EMPTY: 5,
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

    let { width } = Dimensions.get("window");

    //Create the data provider and provide method which takes in two rows of data and return if those two are different or not.
    //THIS IS VERY IMPORTANT, FORGET PERFORMANCE IF THIS IS MESSED UP
    let dataProvider = new DataProvider((r1, r2) => {
      //   console.log(r1);
      //   console.log(r2);
      return r1 !== r2;
    });

    this.headerElement = <Text style={{ color: "#000" }}>header</Text>;

    this.footerElement = <Text style={{ color: "#000" }}>footer</Text>;

    this.separatorElement = <Text style={{ color: "#000" }}>seprator</Text>;

    this.emptyElement = <Text style={{ color: "#000" }}>empty</Text>;

    //Since component should always render once data has changed, make data provider part of the state
    this.state = {
      dataProvider: dataProvider.cloneWithRows(this._generateArray(300)),
      itemsCount: 300,
      refreshing: false,
    };

    //Create the layout provider
    //First method: Given an index return the type of item e.g ListItemType1, ListItemType2 in case you have variety of items in your list/grid
    //Second: Given a type and object set the exact height and width for that type on given object, if you're using non deterministic rendering provide close estimates
    //If you need data based check you can access your data provider here
    //You'll need data in most cases, we don't provide it by default to enable things like data virtualization in the future
    //NOTE: For complex lists LayoutProvider will also be complex it would then make sense to move it to a different file
    this._layoutProvider = new LayoutProvider(
      (index) => {
        let isFirst = index == 0;
        let isLast = index + 1 == this.state.itemsCount;
        let isEmpty = !this.state.itemsCount;
        let isHeader = isFirst;
        let isFooter = isLast;
        let isSeparator = !isLast;
        if (isEmpty) {
          return ViewTypes.EMPTY;
        } else if (isHeader && isSeparator) {
          return ViewTypes.HEADER_WITH_SEPRATOR;
        } else if (isHeader) {
          return ViewTypes.HEADER;
        } else if (isFooter) {
          return ViewTypes.FOOTER;
        } else if (isSeparator) {
          return ViewTypes.FULL_WITH_SEPRATOR;
        } else {
          return ViewTypes.FULL;
        }
      },
      (type, dim) => {
        // switch (type) {
        //   case ViewTypes.HALF_LEFT:
        //     dim.width = width / 2;
        //     dim.height = 160;
        //     break;
        //   case ViewTypes.HALF_RIGHT:
        //     dim.width = width / 2;
        //     dim.height = 160;
        //     break;
        //   case ViewTypes.FULL:
        //     dim.width = width;
        //     dim.height = 140;
        //     break;
        //   default:
        //     dim.width = 0;
        //     dim.height = 0;
        // }
        dim.width = width;
        dim.height = 140;
      }
    );

    this._rowRenderer = this._rowRenderer.bind(this);
  }

  setRefreshing(flag) {
    this.setState({
      refreshing: flag,
    });
  }

  _generateArray(n) {
    let arr = new Array(n);
    for (let i = 0; i < n; i++) {
      arr[i] = i;
    }
    return arr;
  }

  //Given type and data return the view component
  _rowRenderer(type, data) {
    //You can return any view here, CellContainer has no special significance
    switch (type) {
      case ViewTypes.HEADER:
        return (
          <CellContainer style={styles.containerGridLeft}>
            {this.headerElement || null}
            <Text>Data: {data}</Text>
          </CellContainer>
        );
      case ViewTypes.HEADER_WITH_SEPRATOR:
        return (
          <CellContainer style={styles.containerGridLeft}>
            {this.headerElement || null}
            <Text>Data: {data}</Text>
            {this.separatorElement || null}
          </CellContainer>
        );
      case ViewTypes.FOOTER:
        return (
          <CellContainer style={styles.containerGridRight}>
            <Text>Data: {data}</Text>
            {this.footerElement || null}
          </CellContainer>
        );
      case ViewTypes.FULL_WITH_SEPRATOR:
        return (
          <CellContainer style={styles.container}>
            <Text>Data: {data}</Text>
            <TextInput
              placeholder="Search States"
              autoCorrect={false}
              clearButtonMode="always"
              autoCapitalize="none"
            />
            <Button
              title="Submit"
              color={"#000"}
              onPress={() => {
                Alert.alert(index);
              }}
            />
            {this.separatorElement || null}
          </CellContainer>
        );
      case ViewTypes.FULL:
        return (
          <CellContainer style={styles.container}>
            <Text>Data: {data}</Text>
            <TextInput
              placeholder="Search States"
              autoCorrect={false}
              clearButtonMode="always"
              autoCapitalize="none"
            />
            <Button
              title="Submit"
              color={"#000"}
              onPress={() => {
                Alert.alert(index);
              }}
            />
          </CellContainer>
        );
      case ViewTypes.EMPTY:
        return (
          <CellContainer style={styles.container}>
            {this.emptyElement || null}
          </CellContainer>
        );
      default:
        return null;
    }
  }

  render() {
    return (
      <RecyclerListView
        layoutProvider={this._layoutProvider}
        dataProvider={this.state.dataProvider}
        rowRenderer={this._rowRenderer}
        scrollViewProps={{
          keyboardShouldPersistTaps: "always",
          keyboardDismissMode: "on-drag",
          contentContainerStyle: { borderWidth: 1 },
          refreshControl: (
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => {
                this.setRefreshing(true);
                setTimeout(() => {
                  this.setRefreshing(false);
                }, 2000);
              }}
            />
          ),
        }}
        style={{ padding: 10 }}
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
};
