import OpmlParser from 'opmlparser';
import { readdir, createReadStream } from 'fs';
import https from 'https';

var opmlparser = new OpmlParser();

readdir('./import', (err, files) => {

    if (err) throw err;

    files.forEach(file => {
        if (!file.endsWith('.xml')) return;
        console.log(`Parsing ${file}`);
        createReadStream(`./import/${file}`).pipe(opmlparser);
    });
});

opmlparser.on('readable', function () {
    const stream = this;
    var feed;

    while (feed = stream.read()) {
        if (feed.xmlurl === undefined) continue; // Folder

        postToOmnivore(feed);
    }
});

const postToOmnivore = (feed) => {
    const { folder, title, type, xmlurl } = feed;

    const validAuth = checkProvidedEnvironmentVariables();

    if (!validAuth) throw new Error('Missing required environment variables');

    var options = {
        hostname: process.env.OMNIVORE_HOST,
        port: process.env.OMNIVORE_PORT,
        path: process.env.OMNIVORE_GRAPH_QL_PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.OMNIVORE_API_KEY
        }
    }
    var requestData = buildRequest(title, folder, xmlurl);

    const req = https.request(options, (res) => {
        res.on('data', (d) => {
            console.log(d.toString());
            console.log(`:: Success :: Posted ${title} -> ${xmlurl} to Omnivore`);
        })
    })

    req.on('error', (error) => {
        console.error(`:: Failed :: Posting ${title} -> ${xmlurl} to Omnivore`)
        console.error(error)
    })

    req.write(requestData)
    req.end()
}

const checkProvidedEnvironmentVariables = () => {
    if (!process.env.OMNIVORE_HOST) {
        console.error('OMNIVORE_HOST not provided');
        return false;
    }
    if (!process.env.OMNIVORE_PORT) {
        console.error('OMNIVORE_PORT not provided');
        return false;
    }
    if (!process.env.OMNIVORE_GRAPH_QL_PATH) {
        console.error('OMNIVORE_GRAPH_QL_PATH not provided');
        return false;
    }
    if (!process.env.OMNIVORE_API_KEY) {
        console.error('OMNIVORE_API_KEY not provided');
        return false;
    }
    return true;
}

const buildRequest = (title, folder, xmlurl) => {
    return `
    {
        "query": "mutation Subscribe($input: SubscribeInput!) { subscribe(input: $input) {... on SubscribeSuccess {subscriptions {id}}... on SubscribeError {errorCodes}}}",
        "variables": {
            "input": {
                "url": "${xmlurl}",
                "subscriptionType": "RSS"
            }
        }
    }
    `;
}