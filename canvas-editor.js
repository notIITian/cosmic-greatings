/**
 * PPT-Style Interactive Slide Canvas Editor
 * Allows users to write, drag, style, add stickers & photos just like PowerPoint!
 * Fully responsive for Desktop Chrome and Android touch devices.
 */

class SlideEditor {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    if (!this.container) return;

    this.elements = [];
    this.selectedElementId = null;
    this.activeDrag = null;
    this.backgroundStyle = "bg-cosmic";
    this.customBgColor = null;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="slide-workspace">
        <!-- Floating Canvas Stage (16:9 Presentation Slide) -->
        <div id="slide-stage" class="slide-stage bg-cosmic" tabIndex="0">
          <div id="slide-elements-layer" class="slide-elements-layer"></div>
          <div id="slide-effects-layer" class="slide-effects-layer"></div>
        </div>
      </div>
    `;

    this.stage = document.getElementById('slide-stage');
    this.elementsLayer = document.getElementById('slide-elements-layer');
  }

  bindEvents() {
    // Deselect element when clicking on stage background
    this.stage.addEventListener('pointerdown', (e) => {
      if (e.target === this.stage || e.target === this.elementsLayer) {
        this.deselectAll();
      }
    });

    // Global pointer move & up for smooth dragging on both mouse & touch
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', () => this.onPointerUp());

    // Keyboard shortcuts (Delete/Backspace to remove selected)
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedElementId) {
        // Only if not actively editing text inside contentEditable
        const activeEl = document.activeElement;
        if (!activeEl || !activeEl.isContentEditable) {
          e.preventDefault();
          this.removeElement(this.selectedElementId);
        }
      }
    });
  }

  // Add a new Text Box onto the slide
  addText(type = 'heading', customText = null) {
    let text = "Double click to edit message";
    let fontSize = 28;
    let fontWeight = "600";
    let fontFamily = "'Poppins', sans-serif";
    let color = "#ffffff";
    let y = 40;

    if (type === 'heading') {
      text = customText || "Happy Birthday!";
      fontSize = 38;
      fontWeight = "800";
      fontFamily = "'Cinzel', serif";
      color = "#ffd700";
      y = 20;
    } else if (type === 'body') {
      text = customText || "May your journey through the cosmos be filled with stellar joy, boundless love, and brilliant wonders!";
      fontSize = 18;
      fontWeight = "400";
      fontFamily = "'Poppins', sans-serif";
      color = "#e2e8f0";
      y = 48;
    } else if (type === 'cursive') {
      text = customText || "With endless love & cosmic wishes ✨";
      fontSize = 26;
      fontWeight = "600";
      fontFamily = "'Dancing Script', cursive";
      color = "#ff80df";
      y = 75;
    }

    const id = "el_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const item = {
      id: id,
      type: "text",
      text: text,
      x: 10 + Math.random() * 10, // percentage of stage
      y: y + (Math.random() * 6 - 3),
      fontSize: fontSize,
      fontWeight: fontWeight,
      fontFamily: fontFamily,
      color: color,
      textAlign: "center",
      textGlow: type === 'heading',
      width: 80 // percentage
    };

    this.elements.push(item);
    this.renderElement(item);
    this.selectElement(item.id);
    if (window.SoundSystem) window.SoundSystem.playClick();
    return item;
  }

  // Add a Decorative Sticker / Emoji
  addSticker(emoji) {
    const id = "el_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const item = {
      id: id,
      type: "sticker",
      emoji: emoji,
      x: 40 + (Math.random() * 20 - 10),
      y: 40 + (Math.random() * 20 - 10),
      fontSize: 56,
      rotation: Math.floor(Math.random() * 20 - 10)
    };

    this.elements.push(item);
    this.renderElement(item);
    this.selectElement(item.id);
    if (window.SoundSystem) window.SoundSystem.playClick();
    return item;
  }

  // Add an uploaded Image
  addImage(dataUrl) {
    const id = "el_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const item = {
      id: id,
      type: "image",
      src: dataUrl,
      x: 35,
      y: 30,
      width: 30, // % of stage width
      rotation: 0
    };

    this.elements.push(item);
    this.renderElement(item);
    this.selectElement(item.id);
    if (window.SoundSystem) window.SoundSystem.playClick();
    return item;
  }

  // Render a single element in DOM
  renderElement(item) {
    const el = document.createElement('div');
    el.id = item.id;
    el.className = `slide-item slide-item-${item.type}`;
    el.style.left = `${item.x}%`;
    el.style.top = `${item.y}%`;

    if (item.type === 'text') {
      el.style.width = item.width ? `${item.width}%` : 'auto';
      el.innerHTML = `
        <div class="slide-item-content text-content"
             contenteditable="true"
             spellcheck="false"
             style="
               font-family: ${item.fontFamily};
               font-size: ${item.fontSize}px;
               font-weight: ${item.fontWeight};
               color: ${item.color};
               text-align: ${item.textAlign};
               ${item.textGlow ? `text-shadow: 0 0 15px ${item.color}, 0 0 30px ${item.color};` : ''}
             ">${item.text}</div>
        <div class="item-controls">
          <button class="ctrl-btn delete-btn" title="Delete">✕</button>
        </div>
      `;

      // Live content editable update
      const contentEl = el.querySelector('.text-content');
      contentEl.addEventListener('input', () => {
        item.text = contentEl.innerHTML;
      });
      contentEl.addEventListener('focus', () => {
        this.selectElement(item.id);
      });

    } else if (item.type === 'sticker') {
      el.innerHTML = `
        <div class="slide-item-content sticker-content" style="font-size: ${item.fontSize}px; transform: rotate(${item.rotation || 0}deg);">
          ${item.emoji}
        </div>
        <div class="item-controls">
          <button class="ctrl-btn delete-btn" title="Delete">✕</button>
        </div>
      `;
    } else if (item.type === 'image') {
      el.innerHTML = `
        <div class="slide-item-content image-content" style="width: ${item.width || 30}vw; max-width: 280px;">
          <img src="${item.src}" alt="Celebration Image" style="width: 100%; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.5); pointer-events: none;" />
        </div>
        <div class="item-controls">
          <button class="ctrl-btn delete-btn" title="Delete">✕</button>
        </div>
      `;
    }

    // Delete button event
    const delBtn = el.querySelector('.delete-btn');
    if (delBtn) {
      delBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this.removeElement(item.id);
      });
    }

    // Drag handling
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.delete-btn') || e.target.isContentEditable) {
        this.selectElement(item.id);
        return;
      }
      e.preventDefault();
      this.selectElement(item.id);

      const stageRect = this.stage.getBoundingClientRect();
      this.activeDrag = {
        itemId: item.id,
        startX: e.clientX,
        startY: e.clientY,
        itemOrigX: item.x,
        itemOrigY: item.y,
        stageWidth: stageRect.width,
        stageHeight: stageRect.height
      };
    });

    this.elementsLayer.appendChild(el);
  }

  onPointerMove(e) {
    if (!this.activeDrag) return;

    const deltaX = e.clientX - this.activeDrag.startX;
    const deltaY = e.clientY - this.activeDrag.startY;

    const deltaPercentX = (deltaX / this.activeDrag.stageWidth) * 100;
    const deltaPercentY = (deltaY / this.activeDrag.stageHeight) * 100;

    const item = this.elements.find(i => i.id === this.activeDrag.itemId);
    if (!item) return;

    item.x = Math.max(0, Math.min(95, this.activeDrag.itemOrigX + deltaPercentX));
    item.y = Math.max(0, Math.min(90, this.activeDrag.itemOrigY + deltaPercentY));

    const domEl = document.getElementById(item.id);
    if (domEl) {
      domEl.style.left = `${item.x}%`;
      domEl.style.top = `${item.y}%`;
    }
  }

  onPointerUp() {
    this.activeDrag = null;
  }

  selectElement(id) {
    this.deselectAll();
    this.selectedElementId = id;
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('selected');
      this.syncToolbarWithElement(id);
    }
  }

  deselectAll() {
    this.selectedElementId = null;
    this.elementsLayer.querySelectorAll('.slide-item').forEach(el => {
      el.classList.remove('selected');
    });
    this.syncToolbarWithElement(null);
  }

  removeElement(id) {
    this.elements = this.elements.filter(i => i.id !== id);
    const el = document.getElementById(id);
    if (el) el.remove();
    if (this.selectedElementId === id) {
      this.selectedElementId = null;
      this.syncToolbarWithElement(null);
    }
    if (window.SoundSystem) window.SoundSystem.playClick();
  }

  // Change background theme
  setBackground(themeClass, customColor = null) {
    this.stage.className = `slide-stage ${themeClass}`;
    this.backgroundStyle = themeClass;
    this.customBgColor = customColor;
    if (customColor) {
      this.stage.style.background = customColor;
    } else {
      this.stage.style.background = '';
    }
  }

  // Update selected element property
  updateSelected(prop, value) {
    if (!this.selectedElementId) return;
    const item = this.elements.find(i => i.id === this.selectedElementId);
    if (!item) return;

    item[prop] = value;
    const domEl = document.getElementById(item.id);
    if (!domEl) return;

    if (item.type === 'text') {
      const content = domEl.querySelector('.text-content');
      if (content) {
        if (prop === 'fontFamily') content.style.fontFamily = value;
        if (prop === 'fontSize') content.style.fontSize = `${value}px`;
        if (prop === 'fontWeight') content.style.fontWeight = value;
        if (prop === 'color') {
          content.style.color = value;
          if (item.textGlow) {
            content.style.textShadow = `0 0 15px ${value}, 0 0 30px ${value}`;
          }
        }
        if (prop === 'textGlow') {
          content.style.textShadow = value ? `0 0 15px ${item.color}, 0 0 30px ${item.color}` : 'none';
        }
        if (prop === 'textAlign') content.style.textAlign = value;
      }
    } else if (item.type === 'sticker') {
      const content = domEl.querySelector('.sticker-content');
      if (content && prop === 'fontSize') content.style.fontSize = `${value}px`;
    }
  }

  // Sync controls bar with current selection
  syncToolbarWithElement(id) {
    const item = this.elements.find(i => i.id === id);
    const textControls = document.getElementById('slide-text-controls');
    if (!textControls) return;

    if (item && item.type === 'text') {
      textControls.classList.remove('hidden');
      const fontSelect = document.getElementById('slide-font-family');
      const sizeInput = document.getElementById('slide-font-size');
      const colorInput = document.getElementById('slide-text-color');
      const glowCheckbox = document.getElementById('slide-text-glow');

      if (fontSelect) fontSelect.value = item.fontFamily;
      if (sizeInput) sizeInput.value = item.fontSize;
      if (colorInput) colorInput.value = item.color;
      if (glowCheckbox) glowCheckbox.checked = !!item.textGlow;
    } else {
      textControls.classList.add('hidden');
    }
  }

  // Preset Template Fill
  loadTemplate(type = 'birthday', name = 'Friend') {
    this.elementsLayer.innerHTML = '';
    this.elements = [];

    if (type === 'birthday') {
      this.setBackground('bg-cosmic');
      this.addText('heading', `Happy Birthday, ${name}! 🎂`);
      this.addText('body', 'May your special orbit around the sun be loaded with stellar joy, boundless health, and astronomical happiness!');
      this.addText('cursive', 'From across the cosmos with love ❤️');
      this.addSticker('🎉');
      this.addSticker('🌟');
      this.addSticker('🚀');
      this.addSticker('🎈');
    } else if (type === 'congrats') {
      this.setBackground('bg-golden');
      this.addText('heading', `Huge Congratulations! 🏆`);
      this.addText('body', 'You aimed for the stars and conquered them! Truly proud of your monumental achievement and dedication!');
      this.addText('cursive', 'Here is to even greater milestones ahead ✨');
      this.addSticker('🥂');
      this.addSticker('👑');
      this.addSticker('🎇');
      this.addSticker('👏');
    } else {
      this.setBackground('bg-nebula');
      this.addText('heading', `A Cosmic Wish For You ✨`);
      this.addText('body', 'Celebrating you today and every day. May brilliance and good fortune follow your path always!');
      this.addText('cursive', 'Warmest regards and best wishes!');
      this.addSticker('✨');
      this.addSticker('💖');
      this.addSticker('🌸');
    }

    this.deselectAll();
  }

  // Export full slide payload for database storage
  exportData() {
    return {
      backgroundStyle: this.backgroundStyle,
      customBgColor: this.customBgColor,
      elements: this.elements
    };
  }

  // Import into editable slide
  importData(data) {
    if (!data) return;
    this.elementsLayer.innerHTML = '';
    this.elements = [];
    if (data.backgroundStyle) {
      this.setBackground(data.backgroundStyle, data.customBgColor);
    }
    if (Array.isArray(data.elements)) {
      data.elements.forEach(item => {
        this.elements.push(item);
        this.renderElement(item);
      });
    }
    this.deselectAll();
  }

  // Static / Read-only renderer for the Receive view
  static renderReadOnly(containerEl, data) {
    if (!containerEl || !data) return;
    containerEl.className = `slide-stage read-only ${data.backgroundStyle || 'bg-cosmic'}`;
    if (data.customBgColor) {
      containerEl.style.background = data.customBgColor;
    } else {
      containerEl.style.background = '';
    }

    let html = `<div class="slide-elements-layer read-only-layer">`;
    if (Array.isArray(data.elements)) {
      data.elements.forEach(item => {
        if (item.type === 'text') {
          html += `
            <div class="slide-item slide-item-text read-only-item"
                 style="left: ${item.x}%; top: ${item.y}%; width: ${item.width || 80}%;">
              <div class="text-content" style="
                font-family: ${item.fontFamily};
                font-size: ${item.fontSize}px;
                font-weight: ${item.fontWeight};
                color: ${item.color};
                text-align: ${item.textAlign};
                ${item.textGlow ? `text-shadow: 0 0 15px ${item.color}, 0 0 30px ${item.color};` : ''}
              ">${item.text}</div>
            </div>
          `;
        } else if (item.type === 'sticker') {
          html += `
            <div class="slide-item slide-item-sticker read-only-item"
                 style="left: ${item.x}%; top: ${item.y}%;">
              <div class="sticker-content" style="font-size: ${item.fontSize}px; transform: rotate(${item.rotation || 0}deg);">
                ${item.emoji}
              </div>
            </div>
          `;
        } else if (item.type === 'image') {
          html += `
            <div class="slide-item slide-item-image read-only-item"
                 style="left: ${item.x}%; top: ${item.y}%; width: ${item.width || 30}vw; max-width: 280px;">
              <img src="${item.src}" alt="Celebration photo" style="width: 100%; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.6);" />
            </div>
          `;
        }
      });
    }
    html += `</div>`;
    containerEl.innerHTML = html;
  }
}

window.SlideEditor = SlideEditor;
