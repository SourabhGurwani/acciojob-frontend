// src/contexts/ComponentContext.js
import { createContext, useContext, useReducer } from 'react';

const ComponentContext = createContext();

const componentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_COMPONENTS':
      return { ...state, components: action.payload };
    case 'ADD_COMPONENT':
      return { ...state, components: [...state.components, action.payload] };
    case 'UPDATE_COMPONENT':
      return {
        ...state,
        components: state.components.map(comp =>
          comp.id === action.payload.id ? action.payload : comp
        )
      };
    default:
      return state;
  }
};

export const ComponentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(componentReducer, {
    components: [],
    isLoading: false,
    error: null
  });

  return (
    <ComponentContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ComponentContext.Provider>
  );
};

export const useComponents = () => useContext(ComponentContext);