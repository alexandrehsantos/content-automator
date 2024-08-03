const readline = require('readline-sync')
function start(){
    const content = {}
    content.searchTerm = askAnReturnSearchTerm()
    content.prefix = askAndReturnPrefix()

 
    function askAnReturnSearchTerm(){
        return readline.question('Type a subject:')
    }

    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]
        return selectedPrefixText
    }
    console.log(content)
}
start()