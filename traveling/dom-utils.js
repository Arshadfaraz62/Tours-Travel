(() => {
  const getRequiredElement = (selector, root = document) => {
    const element = root.querySelector(selector);

    if (!element) {
      throw new Error(`Missing required element: ${selector}`);
    }

    return element;
  };

  const cloneTemplate = (selector) => {
    const template = getRequiredElement(selector);
    const element = template.content.firstElementChild;

    if (!element) {
      throw new Error(`Template has no root element: ${selector}`);
    }

    return element.cloneNode(true);
  };

  const renderCollection = (container, items, createItem) => {
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      fragment.append(createItem(item, index));
    });

    container.replaceChildren(fragment);
  };

  window.DomUtils = Object.freeze({
    cloneTemplate,
    getRequiredElement,
    renderCollection,
  });
})();
