//simulate a click event to destroy both dropdown and select on option select
export const simulateMouseClick = element => {
  if (element) {
    let mouseClickEvents = ["mousedown", "click", "mouseup"];
    mouseClickEvents.forEach(mouseEventType =>
      element.dispatchEvent(
        new MouseEvent(mouseEventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1,
        }),
      ),
    );
  }
};

export const delayTooltip = func => {
  return setTimeout(() => {
    func();
  }, 400);
};
