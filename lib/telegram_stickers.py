import os
import sys
import asyncio
import shutil
import subprocess
from pathlib import Path

from telethon import TelegramClient


API_ID = int(os.getenv("TELEGRAM_API_ID", "0"))
API_HASH = os.getenv("TELEGRAM_API_HASH", "")

SESSION_PATH = "/home/container/telegram_session"

client = TelegramClient(
    SESSION_PATH,
    API_ID,
    API_HASH
)


async def download_stickers(pack_url, output_dir):

    await client.start()

    print("TELEGRAM: session started")

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    try:
        username = (
            pack_url
            .split("/")
            [-1]
        )

        result = await client.get_messages(
            "stickers",
            ids=None
        )

        print("Telegram sticker pack:", username)

        # download logic stays here

    finally:
        await client.disconnect()
        print("TELEGRAM: session lock released")


def convert_sticker(input_file, output_file):

    converter = (
        "/home/container/.lottie-converter/bin/"
        "lottie_to_webp.sh"
    )

    subprocess.run(
        [
            converter,
            "--output",
            output_file,
            input_file
        ],
        check=True
    )


async def main():

    if len(sys.argv) < 2:
        print(
            "Usage: telegram_stickers.py "
            "<telegram sticker url> <output>"
        )
        return

    url = sys.argv[1]

    output = (
        sys.argv[2]
        if len(sys.argv) > 2
        else "/home/container/media/stickers"
    )

    await download_stickers(
        url,
        output
    )


if __name__ == "__main__":
    asyncio.run(main())
