## SIGGRAPH-experiment

Basic steps to set up and run the script that sends a text+image request to ChatGPT and prints the response.

### Prerequisites
- Python 3.9+ recommended

### Create and activate a virtual environment (macOS/Linux)
```bash
python3 -m venv venv
source venv/bin/activate
```

### Install dependencies
```bash
pip install --upgrade pip
pip install openai replicate requests
```

### Configure API keys
The script currently supports hardcoded keys in `pipeline.py`. Alternatively, you can use environment variables:
```bash
export OPENAI_API_KEY="your_key_here"
export REPLICATE_API_TOKEN="your_replicate_token_here"
```

### Run
```bash
python pipeline.py
```

The script will:
- Load the first entry from `user_inputs` and `images` in `prompts.py`
- Read the image from the `assets/` directory
- Send both to the ChatGPT model (`gpt-5`) as a multimodal request and print the response
- Submit ChatGPT's response and the same image to Replicate (`black-forest-labs/flux-kontext-pro`)
- Save the generated image to `output/<SAME_NAME_AS_INPUT_FILENAME>.png`

### Notes
- Ensure the `assets/` directory contains the referenced image files from `prompts.py`.

