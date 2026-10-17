"""Hashes for voice-derived timings; legacy projects remain readable with a warning."""
import hashlib


def audio_hash(path):
    with open(path, "rb") as f:
        return hashlib.file_digest(f, "sha256").hexdigest()


def text_hash(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def stamp(voice, text=None):
    out = {"audio_sha256": audio_hash(voice)}
    if text is not None:
        out["script_sha256"] = text_hash(text)
    return out


def current(data, voice, label, text=None, strict_legacy=False):
    expected = data.get("audio_sha256")
    script = data.get("script_sha256")
    if expected and (not voice.exists() or expected != audio_hash(voice)):
        print(f"stale {label}: audio changed; ignoring it (regenerate timings)")
        return False
    if text is not None and script and script != text_hash(text):
        print(f"stale {label}: script changed; ignoring it (regenerate alignment)")
        return False
    if not expected and data.get("sha256") and voice.exists():
        digest = (hashlib.sha256(voice.read_bytes() + text.encode("utf-8")).hexdigest()
                  if text is not None else audio_hash(voice))
        digests = {digest}
        if text is None and data.get("retime") is not None and data.get("segments"):
            old_text = data["segments"][0].get("text", "")
            digests.add(hashlib.sha256(voice.read_bytes() + old_text.encode("utf-8")).hexdigest())
        if data["sha256"] not in digests:  # legacy hashes were not kept current (pilot-01): readers warn, retime blocks
            if strict_legacy:
                print(f"stale {label}: legacy hash mismatch; ignoring it (regenerate timings)")
                return False
            print(f"warning: {label} legacy hash differs from the current voice; using it, regenerate if the voice changed")
    if not expected or (text is not None and not script):
        print(f"warning: {label} has no complete provenance; using legacy timings")
    return True
