/***
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import React from "react";
import PropTypes from "prop-types";
import { View, ViewPropTypes, RefreshControl } from "react-native";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from "recyclerlistview"; // 1.1.0

export const ViewTypes = {
  FULL: 0,
  FULL_WITH_SEPRATOR: 1,
  HEADER: 2,
  HEADER_WITH_SEPRATOR: 3,
  FOOTER: 4,
  EMPTY: 5,
};

/***
 * To test out just copy this component and render in you root component
 */
export default class RecyclerListViewWrapper extends React.PureComponent {
  constructor(args) {
    super(args);

    //Define some additional element
    const {
      props: {
        ListHeaderComponent,
        ListFooterComponent,
        ListEmptyComponent,
        ItemSeparatorComponent,
        setElementDimensions,
        data,
      },
    } = this;

    if (ListHeaderComponent) {
      this.headerElement = React.isValidElement(ListHeaderComponent) ? (
        ListHeaderComponent
      ) : (
        <ListHeaderComponent />
      );
    }

    if (ListFooterComponent) {
      this.footerElement = React.isValidElement(ListFooterComponent) ? (
        ListFooterComponent
      ) : (
        <ListFooterComponent />
      );
    }

    if (ItemSeparatorComponent) {
      this.separatorElement = React.isValidElement(ItemSeparatorComponent) ? (
        ItemSeparatorComponent
      ) : (
        <ItemSeparatorComponent />
      );
    }

    if (ListEmptyComponent) {
      this.emptyElement = React.isValidElement(ListEmptyComponent) ? (
        ListEmptyComponent
      ) : (
        <ListEmptyComponent />
      );
    }

    //Create the data provider and provide method which takes in two rows of data and return if those two are different or not.
    //THIS IS VERY IMPORTANT, FORGET PERFORMANCE IF THIS IS MESSED UP
    let dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });

    //Since component should always render once data has changed, make data provider part of the state
    this.state = {
      dataProvider: dataProvider.cloneWithRows(data),
      itemsCount: data.length,
    };

    //Create the layout provider
    //First method: Given an index return the type of item e.g ListItemType1, ListItemType2 in case you have variety of items in your list/grid
    //Second: Given a type and object set the exact height and width for that type on given object, if you're using non deterministic rendering provide close estimates
    //If you need data based check you can access your data provider here
    //You'll need data in most cases, we don't provide it by default to enable things like data virtualization in the future
    //NOTE: For complex lists LayoutProvider will also be complex it would then make sense to move it to a different file
    this._layoutProvider = () => {
      const {
        state: { itemsCount },
      } = this;
      return new LayoutProvider(
        (index) => {
          let isFirst = index == 0;
          let isLast = index + 1 == itemsCount;
          let isEmpty = !itemsCount;
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
        (type, dim, index) => {
          if (
            setElementDimensions &&
            typeof setElementDimensions === "function"
          ) {
            const { width, height } = setElementDimensions(type, index) ?? {};
            if (typeof width === "number") {
              dim.width = width;
            }
            if (typeof height === "number") {
              dim.height = height;
            }
          }
        }
      );
    };

    this._rowRenderer = this._rowRenderer.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {
      props: { data = [], extraData },
    } = this;
    //Since component should always render once data has changed, make data provider part of the state
    if (
      nextProps.data !== this.props.data ||
      nextProps.extraData !== this.props.extraData
    ) {
      this.setState({
        dataProvider: dataProvider.cloneWithRows(data),
        itemsCount: data.length,
      });
    }
  }

  //Given type and data return the view component
  _rowRenderer(type, data, index) {
    //You can return any view here, CellContainer has no special significance
    const {
      props: { renderItem, data: list, keyExtractor },
    } = this;
    const item = renderItem({ item: list[index], index, type }) || null;
    const key =
      typeof keyExtractor === "function"
        ? keyExtractor(list[index], index, type)
        : list[index].key || item.key || index;
    switch (type) {
      case ViewTypes.HEADER:
        return (
          <View key={key} style={{ flex: 1 }}>
            {this.headerElement || null}
            {item}
          </View>
        );
      case ViewTypes.HEADER_WITH_SEPRATOR:
        return (
          <View key={key} style={{ flex: 1 }}>
            {this.headerElement || null}
            {item}
            {this.separatorElement || null}
          </View>
        );
      case ViewTypes.FOOTER:
        return (
          <View key={key} style={{ flex: 1 }}>
            {item}
            {this.footerElement || null}
          </View>
        );
      case ViewTypes.FULL_WITH_SEPRATOR:
        return (
          <View key={key} style={{ flex: 1 }}>
            {item}
            {this.separatorElement || null}
          </View>
        );
      case ViewTypes.FULL:
        return (
          <View key={key} style={{ flex: 1 }}>
            {item}
          </View>
        );
      case ViewTypes.EMPTY:
        return (
          <View key={key} style={{ flex: 1 }}>
            {this.emptyElement || null}
          </View>
        );
      default:
        return null;
    }
  }

  render() {
    const {
      props: {
        keyboardShouldPersistTaps,
        keyboardDismissMode,
        style,
        contentContainerStyle,
        refreshing,
        onRefresh,
        onEndReached,
        onEndReachedThreshold,
      },
    } = this;

    return (
      <RecyclerListView
        scrollViewProps={{
          keyboardShouldPersistTaps,
          keyboardDismissMode,
          contentContainerStyle,
          refreshControl: (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ),
        }}
        layoutProvider={this._layoutProvider()}
        dataProvider={this.state.dataProvider}
        rowRenderer={this._rowRenderer}
        style={style}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
      />
    );
  }
}

RecyclerListViewWrapper.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types

  /**
   * data is just a plain array.
   */
  data: PropTypes.array.isRequired,

  /**
   * Used to extract a unique key for a given item at the specified index. Key is used for caching
   * and as the react key to track item re-ordering. The default extractor checks `item.key`, then
   * falls back to using the index, like React does.
   *
   * e.g:
   *
   * * keyExtractor = (item, index, type) => `key-${index}`;
   *
   * Where `type` is key of ViewTypes
   */
  keyExtractor: PropTypes.func,

  /**
   * Takes an item from data and renders it into the list. Typical usage:
   * ```
   * _renderItem = ({item, index, type}) => (
   *   <TouchableOpacity onPress={() => this._onPress(item)}>
   *     <Text>{item.title}</Text>
   *   <TouchableOpacity/>
   * );
   * ...
   * <Component data={[{title: 'Title Text', key: 'item1'}]} renderItem={this._renderItem} />
   * ```
   * Where `type` is key of ViewTypes
   * Provides additional metadata like `index` if you need it.
   */
  renderItem: PropTypes.func.isRequired,

  /**
   * Determines when the keyboard should stay visible after a tap.
   * - 'never' (the default), tapping outside of the focused text input when the keyboard is up dismisses the keyboard. When this happens, children won't receive the tap.
   * - 'always', the keyboard will not dismiss automatically, and the scroll view will not catch taps, but children of the scroll view can catch taps.
   * - 'handled', the keyboard will not dismiss automatically when the tap was handled by a children, (or captured by an ancestor).
   * - false, deprecated, use 'never' instead
   * - true, deprecated, use 'always' instead
   */
  keyboardShouldPersistTaps: PropTypes.oneOf(["always", "never", "handled"]),

  /**
   * Determines whether the keyboard gets dismissed in response to a drag.
   *   - 'none' (the default), drags do not dismiss the keyboard.
   *   - 'on-drag', the keyboard is dismissed when a drag begins.
   */
  keyboardDismissMode: PropTypes.oneOf(["none", "interactive", "on-drag"]),

  /**
   * Rendered at the very beginning of the list.
   */
  ListHeaderComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.element,
  ]),

  /**
   * Rendered at the very end of the list.
   */
  ListFooterComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.element,
  ]),

  /**
   * Rendered when the list is empty.
   */
  ListEmptyComponent: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.element,
  ]),

  /**
   * Rendered in between adjacent Items within each section.
   */
  ItemSeparatorComponent: PropTypes.func,

  /**
   * Style
   */
  style: ViewPropTypes.style,

  /**
   * These styles will be applied to the scroll view content container which
   * wraps all of the child views. Example:
   *
   *   return (
   *     <ScrollView contentContainerStyle={styles.contentContainer}>
   *     </ScrollView>
   *   );
   *   ...
   *   const styles = StyleSheet.create({
   *     contentContainer: {
   *       paddingVertical: 20
   *     }
   *   });
   */
  contentContainerStyle: ViewPropTypes.style,

  // Provide this method if you want to define specific width/height of an item.
  // this function will provide type and index of an element
  // just return object with { width, height },
  // e.g: <Component setElementDimensions={(type, index) => return { width: 100, height: 100 }} />
  setElementDimensions: PropTypes.func,

  /**
   * A marker property for telling the list to re-render (since it implements PureComponent).
   * If any of your `renderItem`, Header, Footer, etc. functions depend on anything outside of the `data` prop,
   * stick it here and treat it immutably.
   */
  extraData: PropTypes.any,

  /**
   * Called when the view starts refreshing.
   */
  onRefresh: PropTypes.func,

  /**
   * Whether the view should be indicating an active refresh.
   */
  refreshing: PropTypes.bool,

  /**
   * Called when all rows have been rendered and the list has been scrolled
   * to within onEndReachedThreshold of the bottom.  The native scroll
   * event is provided.
   */
  onEndReached: PropTypes.func,

  /**
   * Threshold in pixels for onEndReached.
   */
  onEndReachedThreshold: PropTypes.number,
};

RecyclerListViewWrapper.defaultProps = {
  ListHeaderComponent: null,
  ListFooterComponent: null,
  ListEmptyComponent: null,
  ItemSeparatorComponent: null,
  keyboardShouldPersistTaps: "never",
  keyboardDismissMode: "none",
  style: null,
  contentContainerStyle: null,
  setElementDimensions: () => {},
  keyExtractor: () => {},
  extraData: null,
  onRefresh: () => {},
  refreshing: false,
  onEndReached: () => {},
  onEndReachedThreshold: 0,
};
