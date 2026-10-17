"""UTF-8 console output, including redirected Windows output."""
import sys


def utf8():
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")
