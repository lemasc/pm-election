import { ReactNode } from "react";
import { FuegoProvider } from "swr-firestore-v9";

import { useProvideAuth, authContext } from "./authContext";
import { fuego } from "./firebase";

interface IProps {
  children: ReactNode;
}

function AuthProvider({ children }: IProps): JSX.Element {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export default function MainProvider({ children }: IProps): JSX.Element {
  return (
    <AuthProvider>
      <FuegoProvider fuego={fuego}>{children}</FuegoProvider>
    </AuthProvider>
  );
}
