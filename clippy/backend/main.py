from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import logging
import requests

logging.basicConfig(level=logging.DEBUG)
api = Flask(__name__)

@api.route('/summarize', methods=['GET','POST'])
def get_summary():
    url = "https://api.meaningcloud.com/summarization-1.0"
    txt = request.form.get('txt')

    payload={
        'key': os.getenv('API_MEANINGCLOUD_KEY'),
        'txt': txt,
        'sentences': 1
    }

    response = requests.post(url, data=payload)

    api.logger.info(response.json())
    return response.json()