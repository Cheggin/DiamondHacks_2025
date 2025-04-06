// components/Auth0ProviderWrapper.tsx
import React from 'react';
import Auth0 from 'react-native-auth0';

const auth0 = new Auth0({
  domain: 'YOUR_DOMAIN',
  clientId: 'YOUR_CLIENT_ID',
});

const Auth0Context = React.createContext(auth0);

export const useAuth0 = () => React.useContext(Auth0Context);

export const Auth0ProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Auth0Context.Provider value={auth0}>
      {children} 
    </Auth0Context.Provider>
  );
};
