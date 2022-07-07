import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";
const StoreContext = createContext();

export function StoreProvider(props) {
  const [store, setStore] = createStore({
    page_height: 0,
    tracked_points: [],
  });

  return (
    <StoreContext.Provider value={[store, setStore]}>
      {props.children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
