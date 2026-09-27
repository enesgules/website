import { StrictMode } from "react";
import { prerender } from "react-dom/static";
import { App } from "./App";

export { pages, siteUrl } from "./pages";

export async function render(pathname: string) {
  const { prelude } = await prerender(
    <StrictMode>
      <App initialPathname={pathname} />
    </StrictMode>,
  );

  return new Response(prelude).text();
}
