import sys
import os
import re
import asyncio

from telethon import TelegramClient
from telethon.tl.functions.messages import GetStickerSetRequest
from telethon.tl.types import InputStickerSetShortName


# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


# ============================================================
# TELEGRAM CREDENTIALS
# ============================================================

from telegram_config import API_ID, API_HASH


# ============================================================
# TELEGRAM SESSION
# ============================================================

SESSION_NAME = os.path.join(
    PROJECT_ROOT,
    "telegram_session"
)


# ============================================================
# EXTRACT STICKER PACK SHORT NAME
# ============================================================

def extract_short_name(url):
    """
    Extract the sticker-pack short name from:

    https://t.me/addstickers/DEDSECH
    """

    url = url.strip()

    match = re.search(
        r"^(?:https?://)?t\.me/addstickers/([A-Za-z0-9_]+)(?:\?.*)?$",
        url
    )

    if not match:
        raise ValueError(
            "Invalid Telegram sticker pack link."
        )

    return match.group(1)


# ============================================================
# DOWNLOAD TELEGRAM STICKER PACK
# ============================================================

async def download_stickers(
    url,
    output_dir
):
    """
    Download every sticker from a Telegram sticker pack.

    Returns:
        list of downloaded .webp file paths
    """

    short_name = extract_short_name(url)

    os.makedirs(
        output_dir,
        exist_ok=True
    )

    client = TelegramClient(
        SESSION_NAME,
        API_ID,
        API_HASH
    )

    await client.start()

    try:

        # ----------------------------------------------------
        # GET STICKER PACK
        # ----------------------------------------------------

        sticker_set = await client(
            GetStickerSetRequest(
                stickerset=InputStickerSetShortName(
                    short_name=short_name
                ),
                hash=0
            )
        )

        documents = sticker_set.documents

        if not documents:
            raise ValueError(
                "Sticker pack is empty."
            )

        downloaded = []

        # ----------------------------------------------------
        # DOWNLOAD EACH STICKER
        # ----------------------------------------------------

        for index, document in enumerate(
            documents,
            start=1
        ):

            filename = os.path.join(
                output_dir,
                f"sticker_{index}.webp"
            )

            try:

                downloaded_file = await client.download_media(
                    document,
                    file=filename
                )

                if (
                    downloaded_file
                    and os.path.exists(downloaded_file)
                ):
                    downloaded.append(
                        downloaded_file
                    )

            except Exception as error:

                print(
                    f"WARNING: Sticker {index} failed: {error}",
                    file=sys.stderr
                )

        if not downloaded:
            raise ValueError(
                "No stickers could be downloaded."
            )

        return downloaded

    finally:

        await client.disconnect()


# ============================================================
# COMMAND-LINE MODE
# ============================================================

if __name__ == "__main__":

    if len(sys.argv) != 3:

        print(
            "Usage: python lib/telegram_stickers.py "
            "<sticker_pack_url> <output_dir>"
        )

        sys.exit(1)

    url = sys.argv[1]
    output_dir = sys.argv[2]

    try:

        files = asyncio.run(
            download_stickers(
                url,
                output_dir
            )
        )

        for file_path in files:
            print(file_path)

    except Exception as error:

        print(
            f"ERROR: {error}",
            file=sys.stderr
        )

        sys.exit(1)
