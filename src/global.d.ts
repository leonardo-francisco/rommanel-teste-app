interface BootstrapModal {
  show(): void;
  hide(): void;
}

interface Bootstrap {
  Modal: {
    new (element: HTMLElement): BootstrapModal;
    getInstance(element: HTMLElement): BootstrapModal;
  };
}

interface Window {
  bootstrap: Bootstrap;
}