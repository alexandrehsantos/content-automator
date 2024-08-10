const axios = require("axios");
const sentenceBoundaryDetection = require("sbd");

async function robot(content) {
  await fetchPageContent(content);
  sanitizeContent(content);
  breakContentIntoSentences(content);

  async function searchContentOnWikipedia(content) {
    try {
      const response = await axios.get("https://en.wikipedia.org/w/api.php", {
        params: {
          action: "query",
          list: "search",
          srsearch: content.prefix + " " + content.searchTerm,
          format: "json",
        },
      });

      const results = response.data.query.search;

      // Find the closest match based on the title
      let closestMatch = null;
      let highestMatchScore = -1;

      results.forEach((result) => {
        const matchScore = getMatchScore(result.title, content.searchTerm);
        if (matchScore > highestMatchScore) {
          highestMatchScore = matchScore;
          closestMatch = result.pageid;
        }
      });

      return closestMatch;
    } catch (error) {
      console.error("Error searching Wikipedia:", error);
      return null;
    }
  }

  function getMatchScore(title, searchTerm) {
    // Simple match score based on the number of matching words
    const titleWords = title.toLowerCase().split(" ");
    const searchTermWords = searchTerm.toLowerCase().split(" ");

    let matchScore = 0;
    searchTermWords.forEach((word) => {
      if (titleWords.includes(word)) {
        matchScore++;
      }
    });

    return matchScore;
  }

  async function fetchPageContent() {
    const pageId = await searchContentOnWikipedia(content);

    try {
      const response = await axios.get("https://en.wikipedia.org/w/api.php", {
        params: {
          action: "query",
          prop: "extracts",
          explaintext: true,
          pageids: pageId,
          format: "json",
        },
      });

      const page = response.data.query.pages[pageId];
      content.sourceOriginalContent = page.extract;
    } catch (error) {
      console.error("Error fetching page content:", error);
    }
  }

  function sanitizeContent(content) {
    const withoutBlankLines = removeBlankLines(content.sourceOriginalContent);
    const withoutMarkdown = removeMarkdown(withoutBlankLines);
    const withoutDates = removeParenthesesContent(withoutMarkdown);
    content.sourceSanitized = withoutDates;
  }

  function removeBlankLines(text) {
    const allLines = text.split("\n");
    const withoutBlankLines = allLines.filter(
      (line) => line.trim().length !== 0
    );
    return withoutBlankLines.join("\n");
  }

  function removeMarkdown(text) {
    // Simple example of removing markdown (this can be extended as needed)
    return text.replace(/[*_~`#>+={}|\[\]]/g, "");
  }

  function removeParenthesesContent(text) {
    // Regular expression to match and remove content within parentheses, including nested ones
    return text.replace(/\([^()]*\)/g, ""); // Removes non-nested parentheses content first
  }

  function breakContentIntoSentences(content){
    content.sentences = [];
    
    const sentences = sentenceBoundaryDetection.sentences(content.sourceSanitized)
    console.log(sentences);
    sentences.forEach((sentence)=>{
        content.sentences.push({
            text: sentence,
            keywords: [],
            images: []
        })
    })
  }
}

module.exports = robot;
