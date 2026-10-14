"""Writes the casino batch prompts (gamblers-fallacy v2, Ahmed 2026-10-13: gamblers that look like gamblers, men only,
a roulette wheel/board and a table with an attendant). Same structure as prompts-2026-10-13."""
from pathlib import Path

HERE = Path(__file__).parent

PEOPLE_STYLE = (
    "Style (identical to the references): photographic grayscale editorial cutout, realistic fabric texture, fine tactile "
    "grain, natural proportions, crisp antialiased edges, same lighting from upper left; not shiny clay, not cartoon. "
    "Anonymous person: smooth featureless face with no eyes, nose or mouth, exactly like the reference sheet; hair and beard "
    "rendered like the references. Restrained lavender #D5ADEF only on the garment named; neutral grayscale everything else.\n"
    "Output: the full-body figure centered on a SQUARE canvas (1254x1254 if available, else highest native square), feet near "
    "the lower edge with a small margin, comfortable transparent margins. TRUE RGBA PNG TRANSPARENCY everywhere outside the "
    "subject. No background, no floor, no glow, no drop shadow, no text, logo or watermark. No fake checkerboard pixels.\n"
    "Return only the image."
)
ICON_STYLE = (
    "Treatment identical to the references: photographic grayscale editorial cutout with real material texture and the same "
    "fine tactile grain, same lighting from upper left; restrained lavender #D5ADEF only on the detail named; neutral grayscale "
    "everything else. The Kanz icon style is fixed for every topic: match line weight, shapes, perspective, dimensionality, "
    "shading, texture and palette treatment exactly; no topic-specific style, no glossy colours, no cartoon.\n"
    "Output: one centered subject on a SQUARE canvas (1254x1254 if available, else highest native square), comfortable "
    "transparent margins. TRUE RGBA PNG TRANSPARENCY everywhere outside the subject. No background, no floor, no drop shadow, "
    "no fake checkerboard, no text, letters, numbers, logos or watermark.\n"
    "Return only the image."
)
NPC_REFS = ("Attachments: image 1 = the APPROVED Kanz anonymous-people reference sheet v04 (style authority). Image 2 = the "
            "approved production PNG of M01 neutral (finish, proportions, scale and framing authority). Match their rendering "
            "exactly; only the person and wardrobe change.\n\n")
G01_REFS = ("Attachments: image 1 = the APPROVED Kanz anonymous-people reference sheet v04 (style authority). Image 2 = the "
            "production PNG of gambler G01 (identity, wardrobe, finish and scale authority: the SAME man, same suit, same "
            "lavender tie). Match the rendering exactly; only the pose changes.\n\n")
ICON_REFS = ("Attachments: image 1 = the APPROVED Kanz editorial icon sheet (style authority). Image 2 = an approved Kanz "
             "library icon (finish, material, perspective, scale and framing authority).\n\n")

G01 = ("a casino GAMBLER, a man in his forties with slicked-back dark hair and a short trimmed dark beard, wearing a dark "
       "charcoal three-piece suit (jacket, buttoned waistcoat, trousers), a white dress shirt, a LAVENDER silk necktie, a "
       "pocket watch chain across the waistcoat and polished dark leather shoes")

PROMPTS = {
    # round 1
    "npc-g01-neutral": NPC_REFS + "Create ONE full-body person: " + G01 + ". Standing relaxed in a three-quarter view, "
        "one hand in his trouser pocket, the other holding two casino chips loosely at his side.\n"
        "Lavender accent: the necktie only.\n" + PEOPLE_STYLE,
    "npc-g02-neutral": NPC_REFS + "Create ONE full-body person: a second casino GAMBLER, an older man in his sixties with "
        "short gray hair and a gray moustache, slightly heavier build, wearing a light-gray double-breasted suit, a white "
        "shirt, a LAVENDER bow tie and dark leather shoes. Standing in a three-quarter view, arms folded, watching something "
        "in front of him.\nLavender accent: the bow tie only.\n" + PEOPLE_STYLE,
    "roulette-wheel": ICON_REFS + "Create ONE Kanz explainer icon: a casino ROULETTE WHEEL seen in three-quarter view from "
        "above, like image 2's perspective: a polished wooden bowl rim, the ring of numbered pockets shown as plain "
        "alternating DARK and LIGHT gray pockets (no digits printed), metal frets between pockets, a turned metal centre "
        "turret with four spokes, and one small ball resting in a dark pocket.\nLavender accent: the ball only.\n" + ICON_STYLE,
    "roulette-table-croupier": ("Attachments: image 1 = the APPROVED Kanz anonymous-people reference sheet v04 (people "
        "style authority). Image 2 = the approved production PNG of M01 neutral (person finish and scale authority). "
        "Image 3 = the APPROVED Kanz editorial icon sheet (object finish authority).\n\n"
        "Create ONE scene cutout: a casino CROUPIER standing behind a ROULETTE TABLE, seen from the front and slightly "
        "above. The croupier is an anonymous man (smooth featureless face like the reference sheet), neat short hair, white "
        "long-sleeved shirt, black waistcoat, a LAVENDER bow tie, holding a long wooden croupier rake resting on the table. "
        "The table: a long rounded wooden table with plain felt (no printed numbers, letters or grid lines), a roulette "
        "wheel set into the near end, and two small neat stacks of casino chips on the felt.\n"
        "Lavender accent: the bow tie only.\n" + PEOPLE_STYLE.replace("feet near the lower edge", "table base near the lower edge")),
    # round 2 (needs g01 / g02)
    "npc-g01-betting": G01_REFS + "Create ONE full-body person: the SAME gambler G01, now leaning forward in profile facing "
        "LEFT, both hands pushing a tall stack of casino chips forward and away from him, eager, weight on the front foot.\n"
        "Lavender accent: the necktie only.\n" + PEOPLE_STYLE,
    "npc-g01-pointing": G01_REFS + "Create ONE full-body person: the SAME gambler G01, standing confidently in a three-quarter "
        "view, pointing firmly forward and down with his right index finger as if saying 'this one', chest out, sure of "
        "himself.\nLavender accent: the necktie only.\n" + PEOPLE_STYLE,
    "npc-g01-lost": G01_REFS + "Create ONE full-body person: the SAME gambler G01 after losing everything: shoulders "
        "slumped, head bowed, one hand covering his face, the other hand pulling out an EMPTY trouser pocket lining; tie "
        "loosened.\nLavender accent: the necktie only.\n" + PEOPLE_STYLE,
    "npc-gamblers-back": ("Attachments: image 1 = the APPROVED Kanz anonymous-people reference sheet v04 (style authority). "
        "Images 2 and 3 = the production PNGs of gamblers G01 and G02 (identity and wardrobe authority).\n\n"
        "Create ONE group image: THREE casino gamblers, all men, seen FROM BEHIND, standing side by side close together, "
        "leaning slightly forward and looking down at a table in front of them (the table itself is not shown). Left: G01 "
        "(slicked dark hair, dark charcoal three-piece suit). Middle: G02 (short gray hair, light-gray double-breasted suit). "
        "Right: a third man with short dark hair in a black tuxedo jacket and dark trousers. No faces visible.\n"
        "Lavender accent: only G01's tie, visible as a sliver at the collar, and G02's bow tie ends; nothing else lavender.\n"
        + PEOPLE_STYLE.replace("the full-body figure", "the three full-body figures")),
}

for name, text in PROMPTS.items():
    (HERE / f"{name}.txt").write_text(text, encoding="utf-8")
print("\n".join(PROMPTS))
