import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeSeoData(scrapedData) {

    try {

        const prompt = `
You are an expert SEO analyst.

Analyze the following website data and return ONLY valid JSON.

Website URL: ${scrapedData.url}

Load Time: ${scrapedData.loadTime}ms
Status Code: ${scrapedData.statusCode}
Page Size: ${Math.round(scrapedData.pageSize / 1024)}KB
Word Count: ${scrapedData.wordCount}

META DATA:
- Title: "${scrapedData.metaData.title}"
- Description: "${scrapedData.metaData.description}"
- Canonical: "${scrapedData.metaData.canonical}"
- Robots: "${scrapedData.metaData.robots}"

HEADINGS:
- H1: ${scrapedData.headings.h1}
- H2: ${scrapedData.headings.h2}
- H3: ${scrapedData.headings.h3}

LINKS:
- Internal: ${scrapedData.links.internal}
- External: ${scrapedData.links.external}

IMAGES:
- Total: ${scrapedData.images.total}
- Missing Alt: ${scrapedData.images.missingAlt}

PAGE CONTENT:
${scrapedData.bodyText?.slice(0, 3000)}

Rules:
- Title should be 50-60 chars
- Description should be 150-160 chars
- Exactly 1 H1 is ideal
- All images should have alt text
- Page load time under 3s is ideal
- Give 5-15 SEO issues
- Severity must be:
critical, warning, or info

Return JSON in this exact format:

{
  "overallScore": 85,
  "categories": {
    "seo": 80,
    "performance": 75,
    "accessibility": 70,
    "bestPractices": 90
  },
  "keywords": [
    {
      "word": "seo",
      "count": 10,
      "density": 2.5
    }
  ],
  "issues": [
    {
      "severity": "warning",
      "category": "SEO",
      "message": "Meta description too short",
      "recommendation": "Increase meta description length"
    }
  ]
}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        const text = response.text()
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const analysis = JSON.parse(text);

        return {
            success: true,
            data: analysis,
        };

    } catch (error) {

        console.error(
            "gemini analysis error",
            error
        );

        return {
            success: false,
            error: error.message,
        };
    }
}