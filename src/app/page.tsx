import { HomePage } from "@/modules/home/HomePage";

// src/app/ is the composition layer and nothing else. The page lives in
// src/modules/home/ because that is the surface it renders, and because
// nothing under src/ may import from src/app/ — keeping the UI out of the
// route file is what makes that boundary hold.
export default function Home() {
  return <HomePage />;
}
