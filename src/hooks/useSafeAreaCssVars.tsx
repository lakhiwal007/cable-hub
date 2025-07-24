import { useEffect } from 'react';
import { SafeArea } from 'capacitor-plugin-safe-area';

export default function useSafeAreaCssVars() {
  useEffect(() => {
    (async function() {
      const { insets } = await SafeArea.getSafeAreaInsets();
      console.log(insets);
      for (const [key, value] of Object.entries(insets)) {
        console.log(key, value);
        document.documentElement.style.setProperty(
          `--safe-area-inset-${key}`,
          `${value}px`
        );
      }
    })();
    const listener = SafeArea.addListener('safeAreaChanged', data => {
      const { insets } = data;
      for (const [key, value] of Object.entries(insets)) {
        document.documentElement.style.setProperty(
          `--safe-area-inset-${key}`,
          `${value}px`
        );
      }
    });
    return () => {
      listener.then(handle => handle.remove());
    };
  }, []);
} 