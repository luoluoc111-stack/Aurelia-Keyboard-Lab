(() => {
  const input = document.getElementById('index-query');
  const body = document.body;
  const root = document.documentElement;
  const unit = document.getElementById('radio-unit');
  const machine = document.getElementById('typewriter-machine');
  const status = document.getElementById('status');

  const dInner = document.getElementById('d-inner');
  const dVv = document.getElementById('d-vv');
  const dOffset = document.getElementById('d-offset');
  const dLock = document.getElementById('d-lock');

  const mobileMq = matchMedia('(max-width:700px)');
  let lockedHeight = 0;
  let lockedScrollY = 0;
  let restoreTimer = 0;
  let keyboardSeen = false;

  function viewportHeight() {
    return Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
  }

  function writeDebug() {
    const vv = window.visualViewport;
    dInner.textContent = `innerHeight: ${Math.round(window.innerHeight || 0)}`;
    dVv.textContent = `visualViewport: ${vv ? Math.round(vv.height) : 'n/a'}`;
    dOffset.textContent = `offsetTop: ${vv ? Math.round(vv.offsetTop) : 'n/a'}`;
    dLock.textContent = `lockedHeight: ${Math.round(lockedHeight || 0)}`;

    if (!mobileMq.matches) {
      status.textContent = 'DESKTOP';
      return;
    }

    if (!body.classList.contains('keyboard-lock')) {
      status.textContent = 'READY';
      return;
    }

    const visible = vv ? vv.height : viewportHeight();
    const covered = Math.max(0, lockedHeight - visible - (vv?.offsetTop || 0));
    if (covered > 90) keyboardSeen = true;
    status.textContent = keyboardSeen ? `KEYBOARD ${Math.round(covered)}PX` : 'FOCUS LOCK';
  }

  function lockForKeyboard() {
    if (!mobileMq.matches || body.classList.contains('keyboard-lock')) return;

    clearTimeout(restoreTimer);
    keyboardSeen = false;
    lockedHeight = viewportHeight();
    lockedScrollY = window.scrollY || 0;

    const unitRect = unit.getBoundingClientRect();
    const machineRect = machine.getBoundingClientRect();

    // Keep the paper near its current visible position, but never too low.
    const overlayTop = Math.max(112, Math.min(machineRect.top, lockedHeight * 0.24));
    const overlayLeft = Math.max(15, unitRect.left + 12);
    const overlayWidth = Math.max(260, unitRect.width - 24);

    root.style.setProperty('--locked-height', `${lockedHeight}px`);
    root.style.setProperty('--overlay-top', `${overlayTop}px`);
    root.style.setProperty('--overlay-left', `${overlayLeft}px`);
    root.style.setProperty('--overlay-width', `${overlayWidth}px`);

    body.classList.add('keyboard-lock');

    // Prevent the document itself from being the thing the browser pans.
    window.scrollTo(0, lockedScrollY);
    writeDebug();
  }

  function canUnlock() {
    const vv = window.visualViewport;
    if (!vv) return true;
    return vv.height >= lockedHeight - 80;
  }

  function unlockAfterKeyboard() {
    if (!body.classList.contains('keyboard-lock')) return;

    clearTimeout(restoreTimer);

    const attempt = (tries = 0) => {
      if (canUnlock() || tries >= 8) {
        body.classList.remove('keyboard-lock');
        root.style.removeProperty('--overlay-top');
        root.style.removeProperty('--overlay-left');
        root.style.removeProperty('--overlay-width');

        // Do not immediately replace --locked-height with the shrunken keyboard viewport.
        setTimeout(() => {
          const h = viewportHeight();
          root.style.setProperty('--locked-height', `${h}px`);
          lockedHeight = h;
          writeDebug();
        }, 120);

        window.scrollTo(0, lockedScrollY);
        keyboardSeen = false;
        status.textContent = 'READY';
        return;
      }
      restoreTimer = setTimeout(() => attempt(tries + 1), 80);
    };

    restoreTimer = setTimeout(() => attempt(0), 60);
  }

  function onViewportChange() {
    if (body.classList.contains('keyboard-lock')) {
      // Some Android browsers pan the visual viewport while focusing.
      // We intentionally do not resize/reposition the receiver from vv.height.
      window.scrollTo(0, lockedScrollY);
    } else if (mobileMq.matches) {
      const h = viewportHeight();
      lockedHeight = h;
      root.style.setProperty('--locked-height', `${h}px`);
    }
    writeDebug();
  }

  input.addEventListener('focus', () => {
    lockForKeyboard();
    setTimeout(writeDebug, 50);
    setTimeout(writeDebug, 180);
  });

  input.addEventListener('blur', unlockAfterKeyboard);

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    const lineHeight = parseFloat(getComputedStyle(input).lineHeight) || 24;
    input.style.height = `${Math.min(input.scrollHeight, lineHeight * 3)}px`;
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      input.blur();
    }
  });

  if (window.visualViewport) {
    visualViewport.addEventListener('resize', onViewportChange);
    visualViewport.addEventListener('scroll', onViewportChange);
  }
  window.addEventListener('resize', onViewportChange);
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (document.activeElement === input) input.blur();
      lockedHeight = viewportHeight();
      root.style.setProperty('--locked-height', `${lockedHeight}px`);
      writeDebug();
    }, 300);
  });

  mobileMq.addEventListener('change', () => {
    if (!mobileMq.matches) {
      body.classList.remove('keyboard-lock');
      root.style.removeProperty('--locked-height');
    } else {
      lockedHeight = viewportHeight();
      root.style.setProperty('--locked-height', `${lockedHeight}px`);
    }
    writeDebug();
  });

  lockedHeight = viewportHeight();
  root.style.setProperty('--locked-height', `${lockedHeight}px`);
  writeDebug();
})();