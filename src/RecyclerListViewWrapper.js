/***
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import React from "react";
import PropTypes from "prop-types";
import { RefreshControl, View } from "react-native";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from "recyclerlistview"; // 1.1.0

export const ViewTypes = {
  FULL: "FULL",
  FULL_WITH_SEPRATOR: "FULL_WITH_SEPRATOR",
  FULL_WITH_HEADER: "FULL_WITH_HEADER",
  FULL_WITH_HEADER_WITH_SEPRATOR: "FULL_WITH_HEADER_WITH_SEPRATOR",
  FULL_WITH_FOOTER: "FULL_WITH_FOOTER",
};

/***
 * To test out just copy this component and render in you root component
 */
const RecyclerListViewWrapper = ({
  data = [],
  extraData,
  recyclerListViewProps = {},
  recyclerListViewProps: { style = {}, scrollViewProps = {} } = {},
  refreshing,
  onRefresh,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  ItemSeparatorComponent,
  setElementDimensions,
  renderItem,
  // keyExtractor,
}) => {
  const itemsCount = data.length;
  //  console.log("RLVW data")
  //  console.log(itemsCount)
  // console.log(data)
  // console.log("RLVW extraData")
  // console.log(extraData)
  // let { width } = Dimensions.get("window");

  //Create the data provider and provide method which takes in two rows of data and return if those two are different or not.
  //THIS IS VERY IMPORTANT, FORGET PERFORMANCE IF THIS IS MESSED UP
  let dataProviderInstance = new DataProvider((r1, r2) => {
    // console.log(r1);
    // console.log(r2);
    return r1 !== r2;
  });

  const [dataProvider, setDataProvider] = React.useState(
    dataProviderInstance.cloneWithRows(data)
  );

  let headerElement = null;
  if (ListHeaderComponent) {
    headerElement = React.isValidElement(ListHeaderComponent) ? (
      ListHeaderComponent
    ) : (
      <ListHeaderComponent />
    );
  }

  let footerElement = null;
  if (ListFooterComponent) {
    footerElement = React.isValidElement(ListFooterComponent) ? (
      ListFooterComponent
    ) : (
      <ListFooterComponent />
    );
  }

  let separatorElement = null;
  if (ItemSeparatorComponent) {
    separatorElement = React.isValidElement(ItemSeparatorComponent) ? (
      ItemSeparatorComponent
    ) : (
      <ItemSeparatorComponent />
    );
  }

  let emptyElement = null;
  if (ListEmptyComponent) {
    emptyElement = React.isValidElement(ListEmptyComponent) ? (
      ListEmptyComponent
    ) : (
      <ListEmptyComponent />
    );
  }

  React.useEffect(() => {
    // console.log("RLVW new data");
    // console.log(itemsCount);
    // console.log(data)
    // console.log("RLVW new extraData")
    // console.log(extraData)
    //Since component should always render once data has changed, make data provider part of the state
    setDataProvider(dataProviderInstance.cloneWithRows(data));
  }, [data, extraData, itemsCount]);

  //Create the layout provider
  //First method: Given an index return the type of item e.g ListItemType1, ListItemType2 in case you have variety of items in your list/grid
  //Second: Given a type and object set the exact height and width for that type on given object, if you're using non deterministic rendering provide close estimates
  //If you need data based check you can access your data provider here
  //You'll need data in most cases, we don't provide it by default to enable things like data virtualization in the future
  //NOTE: For complex lists LayoutProvider will also be complex it would then make sense to move it to a different file
  const _layoutProvider = React.useCallback(() => {
    return new LayoutProvider(
      (index) => {
        let isFirst = index == 0;
        let isLast = index + 1 == itemsCount;
        let isHeader = isFirst;
        let isFooter = isLast;
        let isSeparator = !isLast;
        if (isHeader && isSeparator) {
          return ViewTypes.FULL_WITH_HEADER_WITH_SEPRATOR;
        } else if (isHeader) {
          return ViewTypes.FULL_WITH_HEADER;
        } else if (isFooter) {
          return ViewTypes.FULL_WITH_FOOTER;
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
  }, [itemsCount, setElementDimensions]);

  //Given type and data return the view component
  const _rowRenderer = React.useCallback(
    (type, rowData, index) => {
      //You can return any view here, CellContainer has no special significance
      const item = renderItem({ item: rowData, index, type }) || null;
      // console.log("rowData")
      // console.log(rowData)
      // const key =
      //   typeof keyExtractor === "function"
      //     ? keyExtractor(data[index], index, type)
      //     : data[index].key || item.key || index;
      switch (type) {
        case ViewTypes.FULL_WITH_HEADER:
          return (
            <View style={{ flex: 1 }}>
              {headerElement || null}
              {item}
            </View>
          );
        case ViewTypes.FULL_WITH_HEADER_WITH_SEPRATOR:
          return (
            <View style={{ flex: 1 }}>
              {headerElement || null}
              {item}
              {separatorElement || null}
            </View>
          );
        case ViewTypes.FULL_WITH_FOOTER:
          return (
            <View style={{ flex: 1 }}>
              {item}
              {footerElement || null}
            </View>
          );
        case ViewTypes.FULL_WITH_SEPRATOR:
          return (
            <View style={{ flex: 1 }}>
              {item}
              {separatorElement || null}
            </View>
          );
        case ViewTypes.FULL:
          return <View style={{ flex: 1 }}>{item}</View>;
        default:
          return null;
      }
    },
    [renderItem, headerElement, footerElement, separatorElement]
  );

  // should render recyclerlist view if not data
  // as per its recommendations
  if (!itemsCount) {
    return (
      <View style={{ flex: 1 }}>
        {headerElement || null}
        {emptyElement || null}
        {footerElement || null}
      </View>
    );
  }

  return (
    <RecyclerListView
      {...recyclerListViewProps}
      style={{ ...style, minHeight: 1, minWidth: 1 }}
      forceNonDeterministicRendering
      scrollViewProps={{
        ...scrollViewProps,
        refreshControl: (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ),
      }}
      layoutProvider={_layoutProvider()}
      dataProvider={dataProvider}
      rowRenderer={_rowRenderer}
    />
  );
};

RecyclerListViewWrapper.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types

  /**
   * data is just a plain array.
   */
  data: PropTypes.any.isRequired,

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
  // keyExtractor: PropTypes.func,

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
   * Rendered at the very beginning of the list.
   */
  ListHeaderComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),

  /**
   * Rendered at the very end of the list.
   */
  ListFooterComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),

  /**
   * Rendered when the list is empty.
   */
  ListEmptyComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),

  /**
   * Rendered in between adjacent Items within each section.
   */
  ItemSeparatorComponent: PropTypes.func,

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
   * RecyclerListView props
   */
  recyclerListViewProps: PropTypes.object,
};

RecyclerListViewWrapper.defaultProps = {
  ListHeaderComponent: null,
  ListFooterComponent: null,
  ListEmptyComponent: null,
  ItemSeparatorComponent: null,
  setElementDimensions: () => {},
  // keyExtractor: () => {},
  extraData: null,
  onRefresh: () => {},
  refreshing: false,
  recyclerListViewProps: {},
};

export default RecyclerListViewWrapper;
