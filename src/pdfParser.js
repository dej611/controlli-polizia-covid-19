const triggersMapping = {
    'PERSONE CONTROLLATE': 'persone.controllate',
    'PERSONE SANZIONATE': 'persone.sanzionate',
    'PERSONE DENUNCIATE EX ART. 495 E 496 C.P.': 'persone.denunciateFalseDichiarazione',
    'PERSONE DENUNCIATE ex art. 260 r.d. 27.07.1934 n. 1265': 'persone.denunciateQuarantena',
    'ATTIVITA’ O ESERCIZI CONTROLLATI': 'attivita.controllate',
    'TITOLARI DI ATTIVITA’ O ESERCIZI SANZIONATI': 'attivita.sanzionate',
    'CHIUSURA PROVVISORIA DI ATTIVITA’ O ESERCIZI': 'attivita.chiusuraProvvisoria',
    'CHIUSURA DI ATTIVITA’ O ESERCIZI': 'attivita.chiusuraTotale',
    // Before 25th March some labels were different
    'PERSONE DENUNCIATE EX ART. 650 C.P': 'persone.denunciateQuarantena',
    'ESERCIZI COMMERCIALI CONTROLLATI': 'attivita.controllate',
    'TITOLARI ESERCIZI COMMERCIALI DENUNCIATI': 'attivita.sanzionate',
    'SOSPENSIONE ESERCIZI COMMERCIALI EX ART. 15': 'attivita.chiusuraProvvisoria'
};

const triggers = Object.keys(triggersMapping);
const triggersRegExpCache = triggers.map( trigger => RegExp(`^${trigger}`));

module.exports = async (crawler, url) => {
            // return;
    
            const response = await crawler(url);
            
            // scan the text and create a JSON with the data within the PDF
            const json = {
                persone: {
                    controllate: 0,
                    sanzionate: 0,
                    denunciateFalseDichiarazione: 0,
                    denunciateQuarantena: 0
                },
                attivita: {
                    controllate: 0,
                    sanzionate: 0,
                    chiusuraProvvisoria: 0,
                    chiusuraTotale: 0
                }
            };
    
            
            let currentProp = '';
    
            const lines = response.text.split('\n').map( s => s.trim()).filter( s => s.length )
            // scan lines in case this PDF has both table cell content into a single row
            .flatMap((line => {
                return triggersRegExpCache.reduce( (newLines, triggerRegExp, i) => {
                    if(triggerRegExp.test(line)){
                        const [_, valueRow] = line.split(triggers[i]);
                        return [triggers[i], valueRow];
                    }
                    return newLines;
                }, line);
            }));

    
            for( const line of lines){
                // if the line hits a key, then associate the json prop.
                for( let i=0; i < triggers.length; i++){
                    if(triggersRegExpCache[i].test(line)){
                        currentProp = triggersMapping[triggers[i]];
                        break;
                    }
                }
    
                // if not, trim it and check for a number
                // Note 1: sometimes numbers have white spaces inside when coming from a PDFs :(
                // Note 2: remove dots within numbers
                // Note 3: Do not use parseInt here!
                const value = + line.replace(/(\.| )/g, '');
                if(!Number.isNaN(value)){
                    const [root, nested] = currentProp.split('.');
                    json[root][nested] = value;
                }
            }

            return json;
}