import { MantineProvider, ColorSchemeProvider } from '@mantine/core';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';
import { createHashRouter, RouterProvider } from "react-router-dom";
import Root from "./pages/Root";
import Error from './pages/Error';
import Poles from "./endpoints/Poles";
import FinalParty from './endpoints/FinalParty';

export default function App() {
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
    getInitialValueInEffect: true,
  });

  const router = createHashRouter([
    {
      path: "/",
      element: <Root />,
    },
    {
      path: "/poles",
      element: <Poles />,
    },
    {
      path: "/fp",
      element: <FinalParty />,
    },
    {
      // 404 page
      path: "*",
      element: <Error />,
    },
    
  ]);

  const toggleColorScheme = (value) => setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  useHotkeys([['mod+J', () => toggleColorScheme()]]);

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        <RouterProvider router={router} />
      </MantineProvider>
    </ColorSchemeProvider>
  )
}