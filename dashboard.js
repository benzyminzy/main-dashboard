class Workspace {
  constructor($workspace) {
    this.$workspace = $workspace;

    this.index = 0;
  }

  positionWidgetPlace(type) {
    if (this.index === 20) return;

    const $focusedWidget = this.$workspace.querySelector(".focused");

    if (!$focusedWidget) return this.addWidget(type, 0, 0);

    const $widgets = document
      .querySelector(".workspace")
      .querySelectorAll(".widget");

    const widgetHeaderHeight = 32;
    const styles = window.getComputedStyle($focusedWidget);

    const x = parseInt(styles.left) + widgetHeaderHeight;
    const y = parseInt(styles.top) + widgetHeaderHeight;

    this.addWidget(type, x, y);
  }

  addWidget(type, x, y) {
    const $widget = document.createElement("div");

    $widget.style.left = `${x}px`;
    $widget.style.top = `${y}px`;

    $widget.setAttribute("type", type);
    $widget.classList.add("widget");
    $widget.innerHTML = type;

    this.setMaxZIndex($widget);

    this.addResizeWidgetListener($widget);
    this.addDraggableWidgetListener($widget);
    this.deleteWidgetListener($widget);
    this.addZIndexListener($widget);

    this.$workspace.append($widget);
    this.handleFocusedWidget($widget);

    this.getWidgetPosition();

    this.index++;
  }

  handleFocusedWidget($widget) {
    // add Widget
    this.deleteFocusedClass($widget);
    $widget.classList.add("focused");

    // delete FocusedWidget
    $widget
      .querySelector(".closeWidgetBtn")
      .addEventListener("mousedown", (e) => {
        if (!$widget.classList.contains("focused")) return;
        const $widgets = this.$workspace.querySelectorAll(".widget");

        $widgets.forEach(($w) => {
          $w.style.zIndex == $widgets.length - 1
            ? $w.classList.add("focused")
            : null;
        });
      });

    // click Widget
    $widget.addEventListener("mousedown", (e) => {
      if (e.target.classList.contains("closeWidgetBtn")) return;

      this.deleteFocusedClass();
      $widget.classList.add("focused");
    });

    // click except widget
    document.addEventListener("mousedown", (e) => {
      if (e.target.closest(".widget") !== null) {
        return;
      } else if (
        !e.target.classList.contains("widget") &&
        !e.target.classList.contains("menuIcon")
      ) {
        this.deleteFocusedClass();
      }
    });
  }

  deleteFocusedClass() {
    document.querySelectorAll(".widget").forEach(($w) => {
      $w.classList.contains("focused") ? $w.classList.remove("focused") : null;
    });
  }

  addResizeWidgetListener($widget) {
    const $resizer = document.createElement("div");
    $resizer.classList.add("resizer");
    $widget.append($resizer);

    let $focus = false;

    let currentX = 0,
      currentY = 0,
      width = 0,
      height = 0;

    $resizer.addEventListener("mousedown", (e) => {
      $focus = true;
      currentX = e.clientX;
      currentY = e.clientY;

      const styles = window.getComputedStyle($widget);
      width = parseInt(styles.width, 10);
      height = parseInt(styles.height, 10);
    });

    this.$workspace.addEventListener("mousemove", (e) => {
      if ($focus) {
        const newX = e.clientX - currentX;
        const newY = e.clientY - currentY;
        $widget.style.width = `${width + newX}px`;
        $widget.style.height = `${height + newY}px`;
      }
    });
    this.$workspace.addEventListener("mouseleave", () => {
      $focus = false;
      this.getWidgetPosition();
    });
    this.$workspace.addEventListener("mouseup", (e) => {
      $focus = false;
      this.getWidgetPosition();
    });
  }

  addDraggableWidgetListener($widget) {
    const $widgetHeader = document.createElement("div");
    $widgetHeader.classList.add("widgetHeader");
    $widget.append($widgetHeader);

    let isPress = false,
      prevX = 0,
      prevY = 0;

    $widgetHeader.addEventListener("mousedown", (e) => {
      prevX = e.clientX;
      prevY = e.clientY;
      isPress = true;
    });
    $widgetHeader.addEventListener("mouseup", () => {
      isPress = false;
    });
    this.$workspace.addEventListener("mouseleave", () => {
      isPress = false;
    });
    this.$workspace.addEventListener("mousemove", (e) => {
      if (!isPress) return;
      const x = e.clientX - prevX;
      const y = e.clientY - prevY;

      $widget.style.left = `${$widget.offsetLeft + x}px`;
      $widget.style.top = `${$widget.offsetTop + y}px`;

      prevX = e.clientX;
      prevY = e.clientY;
    });
  }

  deleteWidgetListener($widget) {
    const $closeWidgetBtn = document.createElement("button");
    $closeWidgetBtn.classList.add("closeWidgetBtn");
    $closeWidgetBtn.innerHTML = "Close";

    $widget.querySelector(".widgetHeader").append($closeWidgetBtn);

    $closeWidgetBtn.addEventListener("mousedown", (e) => {
      $widget.parentNode.removeChild($widget);
      this.index--;
    });
  }

  addZIndexListener($widget) {
    $widget.addEventListener("mousedown", (e) => {
      this.setMaxZIndex($widget);
    });
  }

  setMaxZIndex($widget) {
    if ($widget) {
      let maxZindex = -1;
      document
        .querySelector(".workspace")
        .querySelectorAll(".widget")
        .forEach(($w) => {
          maxZindex = Math.max(maxZindex, $w.style.zIndex);
        });
      $widget.style.zIndex = maxZindex + 1;
    }
  }

  arrangeZIndex() {
    let zIndex = 0;

    const $widgets = document
      .querySelector(".workspace")
      .querySelectorAll(".widget");

    Array.prototype.slice
      .call($widgets, 0)
      .sort(($w1, $w2) => {
        return parseInt($w1.style.zIndex) > parseInt($w2.style.zIndex) ? 1 : -1;
      })
      .forEach(($w) => {
        $w.style.zIndex = zIndex++;
      });
  }

  // get widgets type & position & size & zindex
  getWidgetPosition() {
    this.arrangeZIndex();
    let widgets = [];
    this.$workspace.querySelectorAll(".widget").forEach(($widget) => {
      const styles = window.getComputedStyle($widget);
      widgets.push({
        type: $widget.getAttribute("type"),
        width: parseInt(styles.width),
        height: parseInt(styles.height),
        left: parseInt(styles.left),
        top: parseInt(styles.top),
        zIndex: parseInt(styles.zIndex),
      });
    });
  }
}
