import { useEffect } from 'react';

// Sets the browser-tab title for a page, e.g. useTitle('Mori') -> "Mori — dhruvi."
export default function useTitle(name) {
  useEffect(() => {
    document.title = name ? `${name} — dhruvi.` : 'dhruvi. — portfolio';
  }, [name]);
}
