/* Scene template. Boards are areas of one continuous world; the camera moves between them.
 * Anchor every entrance to a word in the voice with T("word", afterSeconds). See projects/pilot-01/scene.js. */
const { T, num } = K;
const OBJ = "../../library/objects/";
K.look(); // look v2 (docs/LOOK-V2.md): safe zones, light, contact shadows. Call before the first K.cam()
const b1 = K.board("one", 0, 0);
K.cam(0, "one");
K.text(b1, "عنوان", { x: 500, y: 430, size: 90, head: true, at: 0.3 });
K.duration = (window.DURATION || 5) + 1.6;
