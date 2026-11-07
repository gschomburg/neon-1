// Copy of gregfont's scrub fields (GregUI.bindScrub). Change the original, then copy it here again.
/*
 * Draggable number fields ("scrub fields"), from gregfont's GregUI.bindScrub.
 *
 * Markup:
 *   <label class="field" data-scrub="x" title="Stroke: drag sideways or type">
 *     <span class="field-label">Stroke</span>
 *     <input type="number" step="0.5" min="0">
 *   </label>
 *
 * data-scrub="x" drags sideways; "y" drags up to raise the value.
 * Each 3px of drag is one `step`. Shift moves 10x, Alt moves 0.1x. `min` is respected.
 * A click without dragging focuses the input so you can type.
 * Events on the input: 'scrubstart' (push undo here), 'scrub' (live preview),
 * then one 'change' when the mouse is released.
 *
 * Usage: ScrubField.bindAll(document) after the page loads, or
 * ScrubField.bind(fieldEl) for fields added later. Needs scrub-field.css.
 */
(() => {
  'use strict';

  function bind(field) {
    const input = field.querySelector('input');
    if (!input || field.dataset.scrubBound) return;
    field.dataset.scrubBound = '1';
    const vertical = field.dataset.scrub === 'y';

    field.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || input.disabled || document.activeElement === input) return;
      e.preventDefault();
      const x0 = e.clientX, y0 = e.clientY, start = parseFloat(input.value) || 0;
      const step = parseFloat(input.step) || 1, min = parseFloat(input.min), max = parseFloat(input.max);
      let scrubbing = false;
      try { field.setPointerCapture(e.pointerId); } catch (err) { /* not a live pointer */ }

      function move(ev) {
        const d = vertical ? y0 - ev.clientY : ev.clientX - x0;
        if (!scrubbing && Math.abs(d) < 3) return;
        if (!scrubbing) {
          scrubbing = true;
          field.classList.add('scrubbing');
          input.dispatchEvent(new Event('scrubstart'));
        }
        const mult = ev.shiftKey ? 10 : ev.altKey ? 0.1 : 1;
        let v = start + Math.round(d / 3) * step * mult;
        if (!isNaN(min)) v = Math.max(min, v);
        if (!isNaN(max)) v = Math.min(max, v);
        v = Math.round(v * 1000) / 1000;
        if (String(v) !== input.value) {
          input.value = v;
          input.dispatchEvent(new Event('scrub'));
        }
      }
      function up() {
        field.removeEventListener('pointermove', move);
        field.removeEventListener('pointerup', up);
        field.removeEventListener('pointercancel', up);
        field.classList.remove('scrubbing');
        if (scrubbing) {
          field.dataset.justScrubbed = '1';
          input.dispatchEvent(new Event('change'));
        } else {
          input.focus();
          input.select();
        }
      }
      field.addEventListener('pointermove', move);
      field.addEventListener('pointerup', up);
      field.addEventListener('pointercancel', up);
    });

    // the label's own click would focus the input after a drag
    field.addEventListener('click', (e) => {
      if (field.dataset.justScrubbed) { e.preventDefault(); delete field.dataset.justScrubbed; }
    });
  }

  function bindAll(root) {
    (root || document).querySelectorAll('.field[data-scrub]').forEach(bind);
  }

  window.ScrubField = { bind, bindAll };
})();
