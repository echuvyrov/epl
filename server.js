const http = require('http');
const url = require('url');
const https = require('https');

http.createServer(function (req, res) {
    const query = url.parse(req.url, true).query;

    // Check if the request is for a .js file
    if (req.url.startsWith('/my-script.js')) {
        // Get the 'prompt' parameter from the query string, or use a default prompt
        const prompt = query.prompt;
        const fullPrompt = 'You are a JavaScript code generator. Based on the following prompt, write vanilla JavaScript code that will perform the task requested. Put the code inside a function called doStuff(). Do not apologize. Do not elaborate. Do not provide any commentary. Just output code. Here\'s the prompt:' + prompt;

        // Construct the data to be sent to the OpenAI GPT-3.5 API
        const postData = JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": fullPrompt}],
            temperature: 0,
            max_tokens: 3000,
        });

        console.log("before call...");

        // Set the options for the HTTPS request to the OpenAI GPT-3.5 API
        const options = {
            hostname: 'api.openai.com',
            port: 443,
            path: '/v1/chat/completions',      
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length,
                'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY, // Replace with your own OpenAI API key
            },
        };

        var generatedCode = "";
        // Send the HTTPS request to the OpenAI GPT-3.5 API
        const callOpenAI = https.request(options, function (res2) {
            console.log("inside call...");

            let data = '';
            res2.on('data', (chunk) => {
                console.log("chunked...");
                data = data + chunk.toString();
            });

            res2.on('end', () => {
                const response = JSON.parse(data);
                // Parse the response data from the OpenAI GPT-3.5 API
                
                console.log(response);

                // Get the generated text from the response
                const generatedText = response.choices[0].message.content;

                console.log(generatedText);
                generatedCode = generatedText;

                // Set the content-type to 'text/javascript'
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                // Send the JavaScript code as the response
                res.write(generatedCode);
                res.end();

            });
        });
        
        callOpenAI.write(postData);
        callOpenAI.end();

        req.on('error', error => {
            console.error(error);
        });
        
    } else {
        // If the request is not for a .js file, send a 404 response
        res.writeHead(404);
        res.end();
  }
}).listen(8080);
