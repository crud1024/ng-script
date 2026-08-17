```js
// ==================== 表单侧边栏类 ====================

var DEFAULTS = {
  content: null,
  contentHtml: '',
  contentText: '',
  title: '侧边栏',
  panel: null,
  retry: true,
  maxRetries: 30,
  retryDelay: 300,
  onCreated: null
};

var instanceCounter = 0;

function toElement(value) {
  if (typeof value === 'string') {
    try {
      return document.querySelector(value);
    } catch (error) {
      return null;
    }
  }
  if (value && value.nodeType === 1) {
    return value;
  }
  return null;
}

function styleText(styles) {
  return styles.join(';') + ';';
}

function getBaseId(target) {
  if (target && target.id) {
    return target.id;
  }
  instanceCounter += 1;
  return 'sidebar-target-' + Date.now().toString(36) + '-' + instanceCounter;
}

function getIdSet(baseId) {
  return {
    wrapper: 'wrapper-' + baseId,
    content: 'wrapper-' + baseId + '-content',
    sidebar: baseId === 'zjky_wbs_standard_m' ? 'resizable-container' : baseId + '-sidebar'
  };
}

function mergeOptions(userOptions) {
  var options = {};
  var key;

  for (key in DEFAULTS) {
    if (Object.prototype.hasOwnProperty.call(DEFAULTS, key)) {
      options[key] = DEFAULTS[key];
    }
  }

  if (userOptions) {
    for (key in userOptions) {
      if (Object.prototype.hasOwnProperty.call(userOptions, key)) {
        options[key] = userOptions[key];
      }
    }
  }

  return options;
}

function resolvePanel(target, options) {
  var panel = toElement(options.panel);
  if (panel) {
    return panel;
  }

  if (target && target.id) {
    panel = document.getElementById(target.id + '_fs_ctx');
    if (panel) {
      return panel;
    }
  }

  if (target && target.children && target.children.length) {
    return target.children[0];
  }
  return null;
}

class FormSidebar {
  /**
   * 构造函数
   * @param {string|Element} target 目标元素选择器或 DOM 元素
   * @param {Object} options 配置选项
   * @param {Element|string} options.content 侧边栏自定义内容元素或选择器
   * @param {string} options.contentHtml 侧边栏 HTML 内容
   * @param {string} options.contentText 侧边栏纯文本内容
   * @param {string} options.title 侧边栏标题
   * @param {Element|string} options.panel 保留在目标内部的节点
   * @param {boolean} options.retry 未找到目标时是否重试
   * @param {number} options.maxRetries 最大重试次数
   * @param {number} options.retryDelay 重试间隔
   * @param {Function} options.onCreated 创建完成回调
   */
  constructor(targetInput, userOptions) {
    this._targetInput = targetInput;
    this._options = mergeOptions(userOptions);

    this._target = null;
    this._wrapper = null;
    this._content = null;
    this._sidebar = null;
    this._sidebarContent = null;
    this._panel = null;

    this._retryCount = 0;
    this._retryTimer = null;
    this._listeners = [];
    this._destroyed = false;

    instanceCounter += 1;
    this._key = 'sidebar-' + Date.now().toString(36) + '-' + instanceCounter;

    this._start();
  }

  static create(targetInput, userOptions) {
    return new FormSidebar(targetInput, userOptions);
  }

  destroy() {
    if (this._destroyed) {
      return;
    }
    this._destroyed = true;

    if (this._retryTimer) {
      clearTimeout(this._retryTimer);
      this._retryTimer = null;
    }

    this._listeners.forEach(function (removeListener) {
      removeListener();
    });
    this._listeners.length = 0;

    if (this._wrapper) {
      this._restoreWrapper(this._wrapper);
    }
    if (this._sidebar && this._sidebar.parentElement) {
      this._sidebar.remove();
    }

    this._wrapper = null;
    this._content = null;
    this._sidebar = null;
    this._sidebarContent = null;
  }

  refresh() {
    if (!this._destroyed && this._wrapper) {
      this._syncHeights();
    }
  }

  retryNow() {
    if (!this._destroyed && !this._wrapper) {
      this._start();
    }
  }

  getElements() {
    return {
      target: this._target,
      wrapper: this._wrapper,
      sidebar: this._sidebar,
      content: this._content,
      sidebarContent: this._sidebarContent
    };
  }

  _start() {
    if (this._destroyed) {
      return;
    }

    this._target = toElement(this._targetInput);
    if (this._target && this._target.parentElement) {
      this._install();
      return;
    }

    if (!this._options.retry) {
      console.error('未找到目标元素：' + this._targetInput);
      return;
    }

    this._retryCount += 1;
    if (this._retryCount > this._options.maxRetries) {
      console.error('未找到目标元素：' + this._targetInput);
      return;
    }

    this._retryTimer = setTimeout(() => {
      this._retryTimer = null;
      this._start();
    }, this._options.retryDelay);
  }

  _install() {
    var target = this._target;
    if (!target || !target.parentElement) {
      return false;
    }

    this._cleanupOldLayout();

    var baseId = getBaseId(target);
    var ids = getIdSet(baseId);
    var parent = target.parentElement;
    var wrapper = document.getElementById(ids.wrapper);

    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.id = ids.wrapper;
      wrapper.setAttribute('data-sidebar-wrapper', '1');
      wrapper.setAttribute('data-sidebar-key', this._key);
      parent.appendChild(wrapper);
    }

    var content = document.getElementById(ids.content);
    if (!content) {
      content = document.createElement('div');
      content.id = ids.content;
      content.setAttribute('data-sidebar-content', '1');
      wrapper.appendChild(content);
    }

    wrapper.style.cssText = styleText([
      'display:flex',
      'flex-direction:row',
      'align-items:stretch',
      'width:100%',
      'height:auto',
      'min-height:100%',
      'flex:1 1 auto',
      'gap:10px',
      'position:relative',
      'box-sizing:border-box',
      'overflow:hidden'
    ]);

    content.style.cssText = styleText([
      'display:flex',
      'flex-direction:column',
      'align-items:stretch',
      'flex:1 1 0%',
      'min-width:0',
      'min-height:0',
      'height:auto',
      'gap:var(--outer-margin, 16px)',
      'overflow:auto',
      'box-sizing:border-box'
    ]);

    var originalChildren = Array.prototype.slice.call(parent.children);
    originalChildren.forEach((child) => {
      if (child !== wrapper && !content.contains(child)) {
        content.appendChild(child);
      }
    });

    this._panel = resolvePanel(target, this._options);
    this._movePanelChildrenOut(content, target, this._panel);

    parent.style.minHeight = '100%';
    parent.style.boxSizing = 'border-box';

    target.style.display = 'flex';
    target.style.flexDirection = 'column';
    target.style.flex = '0 0 auto';
    target.style.minWidth = '0';
    target.style.height = 'auto';
    target.style.minHeight = '0';
    target.style.overflow = 'visible';
    target.style.boxSizing = 'border-box';

    var sidebar = document.getElementById(ids.sidebar);
    if (!sidebar) {
      sidebar = document.createElement('div');
      sidebar.id = ids.sidebar;
      sidebar.setAttribute('data-sidebar', '1');
      wrapper.insertBefore(sidebar, content);
    }

    sidebar.style.cssText = styleText([
      'width:20%',
      'min-width:160px',
      'max-width:320px',
      'height:auto',
      'min-height:100%',
      'align-self:stretch',
      'flex-shrink:0',
      'background:#ffffff',
      'border:1px solid rgba(0,0,0,0.08)',
      'border-radius:2px',
      'padding:12px',
      'box-sizing:border-box',
      'overflow:auto',
      'display:flex',
      'flex-direction:column',
      'gap:8px',
      'position:relative',
      'z-index:1'
    ]);

    this._wrapper = wrapper;
    this._content = content;
    this._sidebar = sidebar;

    this._buildSidebarContent();

    this._addListener(window, 'resize', () => {
      if (!this._destroyed) {
        this._syncHeights();
      }
    });

    requestAnimationFrame(() => {
      if (this._destroyed) {
        return;
      }
      this._verifyVisible();
      this._syncHeights();
    });

    if (typeof this._options.onCreated === 'function') {
      this._options.onCreated(this);
    }

    console.log('侧边栏已创建，目标节点：' + (target.id || target.tagName));
    return true;
  }

  _cleanupOldLayout() {
    var target = this._target;
    var baseId = getBaseId(target);
    var ids = getIdSet(baseId);

    var oldWrapper = document.getElementById(ids.wrapper);
    if (oldWrapper && oldWrapper.parentElement) {
      this._restoreWrapper(oldWrapper);
    }

    var oldSidebar = document.getElementById(ids.sidebar);
    if (oldSidebar && oldSidebar.parentElement) {
      oldSidebar.remove();
    }

    if (target && target.id) {
      var panel = document.getElementById(target.id + '_fs_ctx');
      var panelWrapper = document.getElementById('wrapper-' + target.id + '_fs_ctx');
      if (panelWrapper && panelWrapper.parentElement) {
        if (panel && panelWrapper.contains(panel)) {
          panelWrapper.replaceWith(panel);
        } else {
          panelWrapper.remove();
        }
      }
    }
  }

  _restoreWrapper(wrapper) {
    if (!wrapper || !wrapper.parentElement) {
      return;
    }

    var parent = wrapper.parentElement;
    var reference = wrapper.nextSibling;
    var content = null;
    var children = Array.prototype.slice.call(wrapper.children);

    children.forEach(function (child) {
      if (child.getAttribute && child.getAttribute('data-sidebar-content') === '1') {
        content = child;
      }
    });

    var restored = content ? Array.prototype.slice.call(content.children) : children;
    wrapper.remove();

    restored.forEach(function (child) {
      parent.insertBefore(child, reference);
    });
  }

  _movePanelChildrenOut(content, target, panel) {
    if (!panel || !target.children) {
      return;
    }

    var childrenToMove = Array.prototype.filter.call(target.children, function (child) {
      return child !== panel;
    });
    if (!childrenToMove.length) {
      return;
    }

    childrenToMove.forEach(function (child) {
      child.remove();
    });

    var marker = document.createComment('moved-panel-children');
    content.insertBefore(marker, target.nextSibling || null);
    childrenToMove.forEach(function (child) {
      content.insertBefore(child, marker);
    });
    marker.remove();
  }

  _syncHeights() {
    var wrapper = this._wrapper;
    var sidebar = this._sidebar;
    var content = this._content;
    if (!wrapper || !sidebar || !content) {
      return;
    }

    var rect = sidebar.getBoundingClientRect();
    var bottomGap = 16;
    var available = Math.floor(window.innerHeight - rect.top - bottomGap);
    if (available < 300) {
      return;
    }

    var height = available + 'px';
    wrapper.style.height = height;
    wrapper.style.minHeight = '0';
    wrapper.style.overflow = 'hidden';
    sidebar.style.height = height;
    sidebar.style.minHeight = '0';
    content.style.height = height;
    content.style.maxHeight = height;
    content.style.overflow = 'auto';
  }

  _addListener(element, type, listener) {
    element.addEventListener(type, listener);
    this._listeners.push(function () {
      element.removeEventListener(type, listener);
    });
  }

  _buildSidebarContent() {
    var sidebar = this._sidebar;
    var options = this._options;

    sidebar.dataset.sidebarInited = '1';
    sidebar.innerHTML = '';

    var header = document.createElement('div');
    header.style.cssText = styleText([
      'display:flex',
      'align-items:center',
      'padding-bottom:10px',
      'border-bottom:1px solid rgba(0,0,0,0.08)',
      'gap:8px',
      'flex-shrink:0',
      'min-height:32px'
    ]);
    sidebar.appendChild(header);

    var colorBar = document.createElement('div');
    colorBar.style.cssText = styleText([
      'width:4px',
      'height:14px',
      'border-radius:0 3px 3px 0',
      'background:#3877FC',
      'flex-shrink:0'
    ]);
    header.appendChild(colorBar);

    var title = document.createElement('span');
    title.style.cssText = styleText([
      'font-size:14px',
      'font-weight:600',
      'color:#333',
      'cursor:default'
    ]);
    title.textContent = options.title;
    header.appendChild(title);

    var spacer = document.createElement('span');
    spacer.style.cssText = 'flex:1;';
    header.appendChild(spacer);

    var sidebarContent = document.createElement('div');
    sidebarContent.style.cssText = styleText([
      'flex:1 1 0%',
      'overflow:auto',
      'padding:4px 0',
      'font-size:13px',
      'color:#666',
      'line-height:1.6',
      'min-height:100px',
      'box-sizing:border-box'
    ]);
    sidebarContent.setAttribute('data-sidebar-content-body', '1');
    sidebar.appendChild(sidebarContent);

    sidebarContent.textContent = '';
    var customContent = toElement(options.content);
    if (customContent) {
      sidebarContent.appendChild(customContent);
    } else if (options.contentHtml) {
      sidebarContent.innerHTML = options.contentHtml;
    } else if (options.contentText) {
      sidebarContent.textContent = options.contentText;
    }
    this._sidebarContent = sidebarContent;

    var resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = styleText([
      'position:absolute',
      'right:-5px',
      'top:0',
      'width:10px',
      'height:100%',
      'cursor:col-resize',
      'background:transparent',
      'z-index:10',
      'display:flex',
      'align-items:center',
      'justify-content:center'
    ]);

    var dragLine = document.createElement('div');
    dragLine.style.cssText = styleText([
      'width:2px',
      'height:40px',
      'background:rgba(0,0,0,0.15)',
      'border-radius:1px',
      'transition:all 0.2s',
      'pointer-events:none'
    ]);
    resizeHandle.appendChild(dragLine);
    sidebar.appendChild(resizeHandle);

    var isDragging = false;

    this._addListener(resizeHandle, 'mouseenter', function () {
      if (!isDragging) {
        dragLine.style.background = '#3877FC';
        dragLine.style.height = '60px';
      }
    });

    this._addListener(resizeHandle, 'mouseleave', function () {
      if (!isDragging) {
        dragLine.style.background = 'rgba(0,0,0,0.15)';
        dragLine.style.height = '40px';
      }
    });

    this._addListener(resizeHandle, 'mousedown', function (event) {
      isDragging = true;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      dragLine.style.background = '#3877FC';
      dragLine.style.height = '80px';
      event.preventDefault();
    });

    this._addListener(document, 'mousemove', function (event) {
      if (!isDragging) {
        return;
      }
      if (!this._wrapper) {
        return;
      }
      var rect = this._wrapper.getBoundingClientRect();
      var percent = ((event.clientX - rect.left) / rect.width) * 100;
      var newWidth = Math.min(80, Math.max(5, percent));
      sidebar.style.width = newWidth + '%';
      sidebar.style.minWidth = '160px';
      sidebar.style.maxWidth = '80%';
    }.bind(this));

    this._addListener(document, 'mouseup', function () {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      dragLine.style.background = 'rgba(0,0,0,0.15)';
      dragLine.style.height = '40px';
    });
  }

  _verifyVisible() {
    var sidebar = this._sidebar;
    if (!sidebar) {
      return;
    }

    var rect = sidebar.getBoundingClientRect();
    var style = window.getComputedStyle(sidebar);
    var visible = rect.width > 80 && rect.height > 80 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0';

    if (visible) {
      return;
    }

    if (sidebar.parentElement && sidebar.parentElement !== document.body) {
      document.body.appendChild(sidebar);
    }

    sidebar.style.position = 'fixed';
    sidebar.style.top = '64px';
    sidebar.style.right = '16px';
    sidebar.style.bottom = '16px';
    sidebar.style.left = 'auto';
    sidebar.style.width = '220px';
    sidebar.style.minWidth = '220px';
    sidebar.style.maxWidth = '320px';
    sidebar.style.height = 'auto';
    sidebar.style.minHeight = '0';
    sidebar.style.zIndex = '2147483647';
    sidebar.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
    console.log('侧边栏已启用浮动兜底：', rect.width, rect.height);
  }
}

if (typeof window !== "undefined") {
  window.FormSidebar = FormSidebar;
  window.createSidebar = function (targetInput, userOptions) {
    return new FormSidebar(targetInput, userOptions);
  };
  window.createFormSidebar = window.createSidebar;
}
```;
