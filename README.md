# Aurelia Keyboard Lab

A minimal mobile keyboard / viewport experiment for Aurelia Stereo.

## Test target

On Android, open the page and focus the INDEX textarea.

Expected behavior:

1. The receiver keeps the same full height it had before the system keyboard opened.
2. The INDEX paper/input remains visible.
3. The tuner is allowed to sit behind the system keyboard; it must not be pushed upward.
4. Closing the keyboard restores the exact original layout, with no blank panel left behind.
5. Repeat focus/blur several times to check for cumulative drift.

The small debug panel shows `innerHeight`, `visualViewport.height`, `visualViewport.offsetTop`, and the locked pre-keyboard height.

Test in multiple Android browsers if possible (Chrome / Edge / Firefox / OEM browser).
