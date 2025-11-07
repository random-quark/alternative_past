import os
import base64
import time
from openai import OpenAI
from prompts import initial_prompt, user_inputs, images
import replicate
import requests

openai_api_key = "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"

replicate_api_token = "8cf8c09f7bdd8a7fb95debd662ac7ce23762d7f8"

def _read_image_base64(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def main() -> None:
    project_dir = os.path.dirname(__file__)

    # Prefer the hardcoded key if provided; otherwise fall back to env var
    client = OpenAI(api_key=openai_api_key or os.getenv("OPENAI_API_KEY"))
    replicate_client = replicate.Client(api_token=replicate_api_token or os.getenv("REPLICATE_API_TOKEN"))

    total_start = time.perf_counter()

    # Iterate over pairs; if lengths differ, process up to the shorter length
    count = min(len(user_inputs), len(images))
    for idx in range(count):
        users_input = user_inputs[idx]
        image_filename = images[idx]

        # Prepare prompt and image
        formatted_prompt = initial_prompt.replace("{users_input}", users_input)
        image_path = os.path.join(project_dir, "assets", image_filename)
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")

        image_b64 = _read_image_base64(image_path)
        data_url = f"data:image/png;base64,{image_b64}"

        # ChatGPT step timing
        chat_start = time.perf_counter()
        response = client.chat.completions.create(
            model="gpt-5-chat-latest",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": formatted_prompt},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
        )
        chat_end = time.perf_counter()

        chatgpt_output = response.choices[0].message.content
        print(chatgpt_output)

        # Replicate step timing
        rep_start = time.perf_counter()
        with open(image_path, "rb") as img_file:
            generated = replicate_client.run(
                "black-forest-labs/flux-kontext-pro",
                input={
                    "prompt": chatgpt_output,
                    "input_image": img_file,
                    "output_format": "png",
                },
            )
        rep_end = time.perf_counter()

        # Resolve generated output into bytes
        image_bytes = None
        image_url = None

        if hasattr(generated, "read"):
            image_bytes = generated.read()
        elif hasattr(generated, "url"):
            image_url = generated.url()
        elif isinstance(generated, str):
            image_url = generated
        elif isinstance(generated, list) and generated:
            first = generated[0]
            if hasattr(first, "read"):
                image_bytes = first.read()
            elif hasattr(first, "url"):
                image_url = first.url()
            elif isinstance(first, str):
                image_url = first

        if image_bytes is None and image_url:
            resp = requests.get(image_url)
            resp.raise_for_status()
            image_bytes = resp.content

        output_dir = os.path.join(project_dir, "output")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, image_filename)

        if image_bytes is None:
            raise RuntimeError("Failed to obtain generated image bytes from Replicate response")

        with open(output_path, "wb") as f:
            f.write(image_bytes)

        # Print timing with 0.1s precision
        chat_secs = chat_end - chat_start
        rep_secs = rep_end - rep_start
        both_secs = rep_end - chat_start
        print(f"[{idx+1}/{count}] ChatGPT: {chat_secs:.1f}s | Replicate: {rep_secs:.1f}s | Both: {both_secs:.1f}s")

    total_end = time.perf_counter()
    print(f"Processed {count} item(s) in {total_end - total_start:.1f}s total.")


if __name__ == "__main__":
    main()


