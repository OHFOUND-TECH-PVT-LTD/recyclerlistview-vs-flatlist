/***
 Use this component inside your React Native Application.
 A scrollable list with different item type
 */
import React from "react";
import {
  View,
  RefreshControl,
  StyleProp,
  ViewStyle,
} from "react-native";
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
  RecyclerListViewProps,
} from "recyclerlistview"; // 1.1.0
import { RecyclerListViewState } from "recyclerlistview/dist/reactnative/core/RecyclerListView";

export enum ViewTypes {
  FULL,
  FULL_WITH_SEPRATOR,
  HEADER,
  HEADER_WITH_SEPRATOR,
  FOOTER,
  EMPTY,
}

export interface ListRenderItemInfo<ItemT> {
  item: ItemT;
  index: number;
  type: ViewTypes;
}

export type ListRenderItem<ItemT> = (
  info: ListRenderItemInfo<ItemT>
) => React.ReactElement | null;

export interface RecyclerListViewWrapperProps<ItemT>
  extends RecyclerListViewProps {
  // eslint-disable-next-line react/no-unused-prop-types

  /**
   * data is just a plain array.
   */
  data: ReadonlyArray<ItemT> | null | undefined;

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
  keyExtractor?: (item: ItemT, index: number, type: ViewTypes) => string;

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
  renderItem: ListRenderItem<ItemT> | null | undefined;

  /**
   * Determines when the keyboard should stay visible after a tap.
   * - 'never' (the default), tapping outside of the focused text input when the keyboard is up dismisses the keyboard. When this happens, children won't receive the tap.
   * - 'always', the keyboard will not dismiss automatically, and the scroll view will not catch taps, but children of the scroll view can catch taps.
   * - 'handled', the keyboard will not dismiss automatically when the tap was handled by a children, (or captured by an ancestor).
   * - false, deprecated, use 'never' instead
   * - true, deprecated, use 'always' instead
   */
  keyboardShouldPersistTaps?: boolean | "always" | "never" | "handled";

  /**
   * Determines whether the keyboard gets dismissed in response to a drag.
   *   - 'none' (the default), drags do not dismiss the keyboard.
   *   - 'on-drag', the keyboard is dismissed when a drag begins.
   */
  keyboardDismissMode?: "none" | "interactive" | "on-drag";

  /**
   * Rendered at the very beginning of the list.
   */
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;

  /**
   * Rendered at the very end of the list.
   */
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;

  /**
   * Rendered when the list is empty.
   */
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;

  /**
   * Rendered in between adjacent Items within each section.
   */
  ItemSeparatorComponent?: React.ComponentType<any> | null;

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
  contentContainerStyle?: StyleProp<ViewStyle>;

  // Provide this method if you want to define specific width/height of an item.
  // this function will provide type and index of an element
  // just return object with { width, height },
  // e.g: <Component setElementDimensions={(type, index) => return { width: 100, height: 100 }} />
  setElementDimensions?: (
    type: ViewTypes,
    index: number
  ) => { width?: number; height?: number };

  /**
   * A marker property for telling the list to re-render (since it implements PureComponent).
   * If any of your `renderItem`, Header, Footer, etc. functions depend on anything outside of the `data` prop,
   * stick it here and treat it immutably.
   */
  extraData?: any;

  /**
   * Called when the view starts refreshing.
   */
  onRefresh?: (() => void) | null;

  /**
   * Whether the view should be indicating an active refresh.
   */
  refreshing?: boolean | null;
}

interface RecyclerListViewWrapperState extends RecyclerListViewState {
  dataProvider: DataProvider;
  itemsCount: number;
}

/***
 * To test out just copy this component and render in you root component
 */
export default class RecyclerListViewWrapper<
  ItemT = any
> extends React.PureComponent<RecyclerListViewWrapperProps<ItemT>, RecyclerListViewWrapperState> {
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
      ) : null;
    }

    if (ListFooterComponent) {
      this.footerElement = React.isValidElement(ListFooterComponent) ? (
        ListFooterComponent
      ) : null;
    }

    if (ItemSeparatorComponent) {
      this.separatorElement = React.isValidElement(ItemSeparatorComponent) ? (
        ItemSeparatorComponent
      ) : null;
    }

    if (ListEmptyComponent) {
      this.emptyElement = React.isValidElement(ListEmptyComponent) ? (
        ListEmptyComponent
      ) : null;
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
            var viewType: ViewTypes = ViewTypes[type];
            const { width, height } =
              setElementDimensions(viewType, index) ?? {};
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

  headerElement: React.ComponentType<any> | React.ReactElement | null;

  footerElement: React.ComponentType<any> | React.ReactElement | null;

  emptyElement: React.ComponentType<any> | React.ReactElement | null;

  separatorElement: React.ComponentType<any> | null;

  _layoutProvider: () => void;

  componentWillReceiveProps(nextProps) {
    const {
      data: [],
    } = nextProps;
    const {
      state: { dataProvider },
    } = this
    //Since component should always render once data has changed, make data provider part of the state
    if (
      nextProps.data !== this.props.data ||
      nextProps.extraData !== this.props.extraData
    ) {
      this.setState({
        dataProvider: dataProvider.cloneWithRows(nextProps.data),
        itemsCount: nextProps.data?.length,
      });
    }
  }

  //Given type and data return the view component
  _rowRenderer(type: ViewTypes, data, index: number) {
    //You can return any view here, CellContainer has no special significance
    const {
      props: { renderItem, data: list, keyExtractor },
    } = this;
    const item = renderItem({ item: list[index], index, type }) || null;
    const key =
      typeof keyExtractor === "function"
        ? keyExtractor(list[index], index, type)
        : item.key || index;
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
      <RecyclerListView<RecyclerListViewWrapperProps<ItemT>, RecyclerListViewWrapperState>
        scrollViewProps={{
          keyboardShouldPersistTaps,
          keyboardDismissMode,
          contentContainerStyle,
          refreshControl: (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}></RefreshControl>
          ),
        }}
        layoutProvider={this._layoutProvider()}
        dataProvider={this.state.dataProvider}
        rowRenderer={this._rowRenderer}
        style={style}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
      ></RecyclerListView>
    );
  }
}
