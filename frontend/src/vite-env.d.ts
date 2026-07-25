/// <reference types="vite/client" />

interface Window {
  midnight?: {
    mnLace?: {
      enable: () => Promise<any>;
      isEnabled: () => Promise<boolean>;
      name: string;
      icon: string;
      apiVersion: string;
    };
  };
}
