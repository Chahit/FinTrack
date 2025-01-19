import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface Portfolio {
  totalValue: number;
  assets: Asset[];
  performance: Performance;
  error?: string;
}

interface Asset {
  id: string;
  symbol: string;
  units: number;
  currentPrice: number;
  purchasePrice: number;
}

interface Performance {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

interface PortfolioState {
  data: Portfolio | null;
  isLoading: boolean;
  error: string | null;
}

type PortfolioAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Portfolio }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'UPDATE_ASSET'; payload: Asset }
  | { type: 'ADD_ASSET'; payload: Asset }
  | { type: 'REMOVE_ASSET'; payload: string };

const initialState: PortfolioState = {
  data: null,
  isLoading: true,
  error: null
};

const PortfolioContext = createContext<{
  state: PortfolioState;
  dispatch: React.Dispatch<PortfolioAction>;
} | undefined>(undefined);

function portfolioReducer(state: PortfolioState, action: PortfolioAction): PortfolioState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { data: action.payload, isLoading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'UPDATE_ASSET':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          assets: state.data.assets.map(asset =>
            asset.id === action.payload.id ? action.payload : asset
          )
        }
      };
    case 'ADD_ASSET':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          assets: [...state.data.assets, action.payload]
        }
      };
    case 'REMOVE_ASSET':
      if (!state.data) return state;
      return {
        ...state,
        data: {
          ...state.data,
          assets: state.data.assets.filter(asset => asset.id !== action.payload)
        }
      };
    default:
      return state;
  }
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchPortfolioData() {
      if (!session?.user) return;

      dispatch({ type: 'FETCH_START' });
      try {
        const response = await fetch(`/api/portfolio/${session.user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }
        const data = await response.json();
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ 
          type: 'FETCH_ERROR', 
          payload: error instanceof Error ? error.message : 'An error occurred while fetching portfolio data'
        });
      }
    }

    fetchPortfolioData();

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'PRICE_UPDATE') {
          dispatch({
            type: 'UPDATE_ASSET',
            payload: {
              ...data.asset,
              currentPrice: data.price
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, [session]);

  return (
    <PortfolioContext.Provider value={{ state, dispatch }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}