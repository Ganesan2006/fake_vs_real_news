# netlify/functions/hello.py

import json

def handler(event, context):
    # Get the name from the query string, default to "World"
    name = event.get("queryStringParameters", {}).get("name", "World")

    # The body of the response must be a JSON-formatted string
    body = {
        "message": f"Hello, {name}!"
    }

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps(body)
    }
