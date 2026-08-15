import sys
import os
import re
import asyncio

from telethon import TelegramClient
from telethon.tl.functions.messages import GetMessagesRequest
from telethon.tl.types import (
    PeerChannel,
    PeerUser,
    PeerChat,
)

# ============================================================
# LOAD PROJECT ROOT
# ============================================================

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


# ============================================================
# LOAD TELEGRAM CREDENTIALS
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
# EXTRACT TELEGRAM MESSAGE LINK
# ============================================================

def parse_telegram_link(url):
    """
    Supports public Telegram message links such as:

    https://t.me/channelname/123
    https://t.me/channelname/123?single
    https://t.me/c/1234567890/123

    Returns:
        {
            "type": "public" or "private",
            "chat": ...,
            "message_id": ...
        }
    """

    url = url.strip()

    # --------------------------------------------------------
    # PUBLIC CHANNEL / GROUP
    # --------------------------------------------------------

    match = re.match(
        r"^https?://t\.me/([A-Za-z0-9_]+)/(\d+)(?:\?.*)?$",
        url
    )

    if match:
        return {
            "type": "public",
            "chat": match.group(1),
            "message_id": int(match.group(2)),
        }

    # --------------------------------------------------------
    # PRIVATE CHANNEL / GROUP
    #
    # Example:
    # https://t.me/c/1234567890/123
    # --------------------------------------------------------

    match = re.match(
        r"^https?://t\.me/c/(\d+)/(\d+)(?:\?.*)?$",
        url
    )

    if match:
        return {
            "type": "private",
            "chat": int(match.group(1)),
            "message_id": int(match.group(2)),
        }

    raise ValueError(
        "Invalid Telegram message link."
    )


# ============================================================
# DOWNLOAD TELEGRAM MEDIA
# ============================================================

async def download_telegram_media(
    url,
    output_dir
):
    """
    Download media from a Telegram message.

    Returns:
        downloaded file path
    """

    parsed = parse_telegram_link(url)

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
        # RESOLVE CHAT
        # ----------------------------------------------------

        if parsed["type"] == "public":
            entity = await client.get_entity(
                parsed["chat"]
            )

        else:
            # Telegram's /c/ internal ID normally needs
            # the -100 prefix when resolving the entity.
            channel_id = int(
                f"-100{parsed['chat']}"
            )

            entity = await client.get_entity(
                channel_id
            )

        # ----------------------------------------------------
        # GET MESSAGE
        # ----------------------------------------------------

        messages = await client.get_messages(
            entity,
            ids=parsed["message_id"]
        )

        if not messages:
            raise ValueError(
                "Telegram message was not found."
            )

        message = messages

        # ----------------------------------------------------
        # CHECK MEDIA
        # ----------------------------------------------------

        if not message.media:
            raise ValueError(
                "This Telegram message does not contain media."
            )

        # ----------------------------------------------------
        # DOWNLOAD
        # ----------------------------------------------------

        downloaded = await client.download_media(
            message,
            file=output_dir
        )

        if not downloaded:
            raise ValueError(
                "Telegram media could not be downloaded."
            )

        if not os.path.exists(downloaded):
            raise ValueError(
                "Downloaded Telegram file does not exist."
            )

        print(downloaded)

        return downloaded

    finally:
        await client.disconnect()


# ============================================================
# COMMAND-LINE MODE
# ============================================================

if __name__ == "__main__":

    if len(sys.argv) != 3:
        print(
            "Usage: python lib/telegram_media.py "
            "<telegram_message_link> <output_dir>"
        )
        sys.exit(1)

    url = sys.argv[1]
    output_dir = sys.argv[2]

    try:

        file_path = asyncio.run(
            download_telegram_media(
                url,
                output_dir
            )
        )

        print(
            f"SUCCESS:{file_path}"
        )

    except Exception as error:

        print(
            f"ERROR: {error}",
            file=sys.stderr
        )

        sys.exit(1)
