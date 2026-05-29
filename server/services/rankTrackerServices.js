import dotenv from "dotenv";
dotenv.config();

import SerpApi from "google-search-results-nodejs";

const search = new SerpApi.GoogleSearch(
  process.env.SERP_API_KEY
);

export async function ranktracker(
  keyword,
  targetDomain
) {

  try {

    const data =
      await new Promise((resolve, reject) => {

        search.json({

          engine: "google",

          q: keyword,

          num: 100,

        },

        (result) => {

          if (result.error) {

            reject(result.error);

          } else {

            resolve(result);

          }

        });

      });

    const organicResults =
      data.organic_results || [];
      console.log(
  organicResults.map(r => ({
    title: r.title,
    link: r.link
  }))
);

    let found = null;

    const competitors =
      organicResults.map((item, index) => {

        const domain =
          new URL(item.link)
            .hostname
            .replace("www.", "");

        const result = {

          position: index + 1,

          url: item.link,

          domain,

          title: item.title,

          snippet:
            item.snippet || ""

        };

        // match target domain
        if (
          domain.includes(
            targetDomain.replace(
              "www.",
              ""
            )
          )
        ) {

          found = result;

        }

        return result;

      });

    return {

      success: true,

      data: {

        keyword,

        targetDomain,

        position:
          found?.position || null,

        page:
          found ? 1 : null,

        title:
          found?.title || "",

        snippet:
          found?.snippet || "",

        competitors,

        totalResultsScanned:
          competitors.length

      }

    };

  } catch (error) {

    console.log(
      "SERP API ERROR:",
      error.message
    );

    return {

      success: false,

      data: {
        totalResultsScanned: 0
      },

      error: error.message

    };

  }

}