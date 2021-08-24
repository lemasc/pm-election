import { useState, useEffect, useContext, createContext } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, User } from "firebase/auth";

import { auth, db } from "./firebase";
import axios, { AxiosResponse } from "axios";
import { CustomToken, LoginForm, LoginResult, VotesData } from "@/types/login";
import { useDocument } from "swr-firestore-v9";

type FirebaseResult = {
  success: boolean;
  message?: string;
};

/**
 * Creates an email address based on the given student ID.
 * @param sid Target Student ID
 * @returns Formatted email address.
 */
export function createEmail(sid: string | string[]) {
  return "wpm" + sid + "@pnru.ac.th";
}

export function createSID(email: string) {
  return email.slice(3, 8);
}

interface IAuthContext {
  user: User | null;
  ready: boolean;
  votes: VotesData | null | undefined;
  profile: LoginResult | undefined;
  signIn: (sid: string, password: string) => Promise<FirebaseResult>;
  signInNative: (data: LoginForm) => Promise<FirebaseResult>;
  signOut: () => Promise<void>;
}

export const authContext = createContext<IAuthContext | undefined>(undefined);

export const useAuth = (): IAuthContext => {
  const ctx = useContext(authContext);
  if (!ctx) throw new Error("Context must be used inside provider");
  return ctx;
};

// Provider hook that creates auth object and handles state
export function useProvideAuth(): IAuthContext {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<LoginResult | undefined>(undefined);
  const [ready, setReady] = useState<boolean>(false);
  const { data: votes } = useDocument<VotesData>(
    user ? `/votes/${user.uid}` : null,
    {
      listen: true,
      parseDates: ["timestamp"],
    }
  );

  const signIn = async (
    sid: string,
    password: string
  ): Promise<FirebaseResult> => {
    try {
      await signInWithEmailAndPassword(auth, createEmail(sid), password);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.code };
    }
  };

  const signInNative = async (data: LoginForm): Promise<FirebaseResult> => {
    try {
      await axios.post("/api/login", new URLSearchParams(data));
      return { success: true };
    } catch (err) {
      const response = err.response as AxiosResponse;
      if (response) {
        switch (response.status) {
          case 403:
            return { success: false, message: "invalid-captcha" };
          case 404:
            return { success: false, message: "invalid-credentials" };
        }
      }
      return { success: false, message: "server-error" };
    }
  };

  const signOut = async (): Promise<void> => {
    await auth.signOut();
    setUser(null);
    setProfile(undefined);
  };

  useEffect(() => {
    let _isMounted = true;
    let authReady: ReturnType<typeof setTimeout>;
    return auth.onIdTokenChanged(async (curUser) => {
      if (!_isMounted) return;
      if (authReady) clearTimeout(authReady);
      if (curUser) {
        // Check previous state if user exists
        if (curUser !== user) {
          setReady(false);
        } else {
          authReady = setTimeout(() => setReady(false), 1000);
        }
        const claims: CustomToken = (await curUser.getIdTokenResult())
          .claims as CustomToken;
        setProfile({
          stdID: createSID(curUser.email as string),
          stdName: curUser.displayName as string,
          stdClass: claims.class,
          stdNo: claims.no,
        });
        setUser(curUser);
        clearTimeout(authReady);
        setReady(true);
      } else {
        setReady(false);
        authReady = setTimeout(() => {
          if (
            router.pathname.includes("/admin") &&
            router.pathname !== "/admin" &&
            !user
          ) {
            router.replace("/admin");
          } else {
            setReady(true);
          }
        }, 1000);
        setUser(null);
      }
      return () => {
        _isMounted = false;
      };
    });
  }, [router, user]);

  return {
    user,
    votes,
    profile,
    ready,
    signIn,
    signInNative,
    signOut,
  };
}
