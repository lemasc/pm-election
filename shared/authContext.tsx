import { useState, useEffect, useContext, createContext } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "./firebase";
import { AxiosResponse } from "axios";
import { CustomToken, LoginForm, LoginResult, VotesData } from "@/types/login";
import { useDocument } from "swr-firestore-v9";
import instance from "./request";
import { Candidate } from "./candidates";
import LogRocket from "logrocket";

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

const authPages = ["/profile", "/select", "/success"];

interface IAuthContext {
  user: User | null;
  ready: boolean;
  votes: VotesData | null | undefined;
  profile: LoginResult | undefined;
  signIn: (sid: string, password: string) => Promise<FirebaseResult>;
  signInNative: (data: LoginForm, onRetry: () => void) => Promise<FirebaseResult>;
  select: (candidate: Candidate, ip: string) => Promise<boolean>;
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
  const [votes, setVotes] = useState<VotesData | null>(null);
  const { data: _votes } = useDocument<VotesData>(user ? `/votes/${user.uid}` : null, {
    listen: true,
    parseDates: ["timestamp"],
  });
  useEffect(() => {
    let time;
    if (time) clearTimeout(time);
    if (_votes !== undefined) {
      setVotes(_votes?.selected ? _votes : null);
    } else {
      setVotes(null);
    }
    setTimeout(() => setReady(_votes !== null), 1000);
  }, [_votes]);

  const signIn = async (sid: string, password: string): Promise<FirebaseResult> => {
    try {
      await signInWithEmailAndPassword(auth, createEmail(sid), password);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.code };
    }
  };

  const signInNative = async (data: LoginForm, onRetry: () => void): Promise<FirebaseResult> => {
    try {
      await instance(undefined, onRetry).post("/api/login", new URLSearchParams(data));
      return { success: true };
    } catch (err) {
      const response = err.response as AxiosResponse;
      if (response) {
        switch (response.status) {
          case 401:
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

  const select = async (candidate: Candidate, ip: string) => {
    if (!user || !profile || !navigator || !candidate.index) return false;

    const votes = {
      name: candidate.title + candidate.name + " " + candidate.surname,
      selected: candidate.index,
      ...profile,
      timestamp: serverTimestamp(),
      ip,
      useragent: navigator.userAgent,
    };
    await setDoc(doc(db, "votes", user.uid), votes);
    setVotes({ ...votes, timestamp: new Date() });
    return true;
  };
  useEffect(() => {
    let _isMounted = true;
    return auth.onIdTokenChanged(async (curUser) => {
      if (!_isMounted) return;
      if (curUser) {
        const claims: CustomToken = (await curUser.getIdTokenResult()).claims as CustomToken;
        setProfile({
          stdID: createSID(curUser.email as string),
          stdName: curUser.displayName as string,
          stdClass: claims.class,
          stdNo: claims.no,
        });
        LogRocket.identify(curUser.uid, {
          name: curUser.displayName as string,
          email: curUser.email as string,
        });
        setUser(curUser);
      } else {
        setUser(null);
      }
      return () => {
        _isMounted = false;
      };
    });
  }, [router, user]);
  /*
  useEffect(() => {
    let authReady: ReturnType<typeof setTimeout>;
    let target = "";

    const handleRouteChange = (url: string) => {
      if (authReady) clearTimeout(authReady);
      if (user !== undefined && user !== null) return;
      authReady = setTimeout(() => {
        if (ready && user === null) {
          if (url.includes("/admin")) {
            return;
          } else if (authPages.includes(url)) {
            target = "/";
          }
          target !== "" && router.replace(target);
        }
      }, 5000);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    handleRouteChange(router.pathname);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [ready, router, user]);*/

  return {
    user,
    select,
    votes,
    profile,
    ready,
    signIn,
    signInNative,
    signOut,
  };
}
