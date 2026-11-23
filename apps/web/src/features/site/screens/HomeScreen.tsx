import { CategoryGrid } from "../components/CategoryGrid";
import { HomeCta } from "../components/HomeCta";
import { HomeHero } from "../components/HomeHero";
import { HomeJobs } from "../components/HomeJobs";
import { HomeSteps } from "../components/HomeSteps";
import { HomeTrust } from "../components/HomeTrust";
import { HomeWorkers } from "../components/HomeWorkers";
import { SiteFooter } from "../components/SiteFooter";
import { siteCopy } from "../copy/site";

/** Home page: hero, then the design's category, steps, jobs, workers and trust sections. */
export function HomeScreen() {
  return (
    <div className="min-h-screen bg-white font-sans text-ink-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-honey-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-ink-900"
      >
        {siteCopy.skipToContent}
      </a>
      <HomeHero />
      <main id="main-content">
        <CategoryGrid />
        <HomeSteps />
        <HomeJobs />
        <HomeWorkers />
        <HomeTrust />
        <HomeCta />
      </main>
      <SiteFooter />
    </div>
  );
}
