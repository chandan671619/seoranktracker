    // server/services/scraperService.js

import axios from "axios";

export async function scrapeUrl(url) {
  try {
    const apiKey = process.env.SERP_API_KEY;

    // Extract domain from URL
    const domain = new URL(url).hostname.replace("www.", "");

    // Search domain on Google
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google",
        q: domain,
        api_key: apiKey,
      },
    });

    const results = response.data.organic_results || [];

    // Total results
    const totalResults = results.length;

    // Internal & external links approximation
    let internalLinks = 0;
    let externalLinks = 0;

    results.forEach((result) => {
      try {
        const resultDomain = new URL(result.link).hostname.replace(
          "www.",
          ""
        );

        if (resultDomain.includes(domain)) {
          internalLinks++;
        } else {
          externalLinks++;
        }
      } catch (err) {}
    });

    // Heading approximation
    const headings = {
      h1: results.length,
      h2: 0,
      h3: 0,
      h4: 0,
      h5: 0,
      h6: 0,
      h1Texts: results.map((r) => r.title || ""),
    };

    // Meta data approximation
    const metaData = {
      title: results[0]?.title || "",
      description: results[0]?.snippet || "",
      canonical: url,
      robots: "",
      ogTitle: results[0]?.title || "",
      ogDescription: results[0]?.snippet || "",
      ogImage: "",
      twitterCard: "",
      viewport: "",
      charset: "UTF-8",
    };

    // Images approximation
    const images = {
      total: 0,
      missingAlt: 0,
      withAlt: 0,
    };

    // Body text approximation
    const bodyText = results
      .map((r) => `${r.title || ""} ${r.snippet || ""}`)
      .join(" ");

    // Word count
    const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

    // Page size approximation
    const pageSize = JSON.stringify(response.data).length;

    return {
      success: true,
      data: {
        metaData,
        headings,
        links: {
          internal: internalLinks,
          external: externalLinks,
          total: totalResults,
        },
        images,
        wordCount,
        pageSize,
        bodyText,
        loadTime: 0,
        statusCode: 200,
        url,
      },
    };
  } catch (error) {
    console.error("[SCRAPER ERROR]:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
}