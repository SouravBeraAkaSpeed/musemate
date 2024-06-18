"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { AuthUser } from "@supabase/supabase-js";
import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useToast } from "../ui/use-toast";

interface UserState {
  user: AuthUser | null;
}

type Action =
  | {
      type: "SIGN_IN";
      payload: {
        user: AuthUser | null;
      };
    }
  | {
      type: "SIGN_OUT";
    };

const initialUserState: UserState = { user: null };

const SupabaseUserContext = createContext<{
  state: UserState;
  dispatch: Dispatch<Action>;
  getUser: () => void;
}>({
  state: initialUserState,
  dispatch: () => {},
  getUser: () => {},
});

const appReducer = (
  state: UserState = initialUserState,
  action: Action
): UserState => {
  switch (action.type) {
    case "SIGN_IN":
      return {
        ...state,
        user: action.payload.user,
      };
    case "SIGN_OUT":
      return {
        ...state,
        user: null,
      };
    default:
      return initialUserState;
  }
};

export const useSupabaseUser = () => {
  return useContext(SupabaseUserContext);
};

interface SupabaseUserProviderProps {
  children: React.ReactNode;
}

export const SupabaseUserProvider: React.FC<SupabaseUserProviderProps> = ({
  children,
}) => {
  const { toast } = useToast();
  const [state, dispatch] = useReducer(appReducer, initialUserState);

  const supabase = createClientComponentClient();

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      dispatch({
        type: "SIGN_IN",
        payload: { user },
      });
    } else {
      dispatch({
        type: "SIGN_OUT",
      });
    }
  };

  useEffect(() => {
    console.log("User State Changed", state);
  }, [state]);

  useEffect(() => {
    getUser();
  }, [supabase, toast]);

  return (
    <SupabaseUserContext.Provider value={{ state, dispatch, getUser }}>
      {children}
    </SupabaseUserContext.Provider>
  );
};
