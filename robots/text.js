const axios = require('axios');

async function robot(content) {
    const pageId = await searchContentOnWikipedia(content);
    if (pageId) {
        content.sourceContentOriginal = await fetchPageContent(pageId);
        sanitizeContent(content)
        // breakContentIntoSentences(content)
    } else {
        console.log('No close match found.');
    }

    async function searchContentOnWikipedia(content) {
        try {
            const response = await axios.get('https://en.wikipedia.org/w/api.php', {
                params: {
                    action: 'query',
                    list: 'search',
                    srsearch: content.prefix + " " + content.searchTerm,
                    format: 'json',
                },
            });

            const results = response.data.query.search;
           
            // Find the closest match based on the title
            let closestMatch = null;
            let highestMatchScore = -1;

            results.forEach(result => {
                const matchScore = getMatchScore(result.title, content.searchTerm);
                if (matchScore > highestMatchScore) {
                    highestMatchScore = matchScore;
                    closestMatch = result.pageid;
                }
            });

            return closestMatch;
        } catch (error) {
            console.error('Error searching Wikipedia:', error);
            return null;
        }
    }

    function getMatchScore(title, searchTerm) {
        // Simple match score based on the number of matching words
        const titleWords = title.toLowerCase().split(' ');
        const searchTermWords = searchTerm.toLowerCase().split(' ');

        let matchScore = 0;
        searchTermWords.forEach(word => {
            if (titleWords.includes(word)) {
                matchScore++;
            }
        });

        return matchScore;
    }

    async function fetchPageContent(pageId) {
        try {
            const response = await axios.get('https://en.wikipedia.org/w/api.php', {
                params: {
                    action: 'query',
                    prop: 'extracts',
                    explaintext: true,
                    pageids: pageId,
                    format: 'json',
                },
            });
    
            const page = response.data.query.pages[pageId];
            return page.extract;
        } catch (error) {
            console.error('Error fetching page content:', error);
            return null;
        }
    }
    
    function sanitizeContent(content){
        const withoutBlankLines = removeBlankLines(content.sourceContentOriginal)
        console.log("Content without blank lines " + withoutBlankLines)

        function removeBlankLines(text){
            const allLines = text.split('\n')
            return allLines;
        }
    }
}


module.exports = robot;
