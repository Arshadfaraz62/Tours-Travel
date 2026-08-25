const { cloneTemplate, getRequiredElement, renderCollection } = window.DomUtils;

const services = [
  { image: 'trip1.png', title: 'Ship Cruises', properties: 150 },
  { image: 'trip3.png', title: 'Summer Rest', properties: 150 },
  { image: 'trip4.png', title: 'Mountains Tours', properties: 150 },
];

const packages = [
  {
    image: 'paris.avif',
    price: '1,90,000₹',
    location: 'paris',
    duration: '5 days - 4 nights',
    rating: 5,
  },
  {
    image: 'newyork.jpg',
    price: '1,45,000₹',
    location: 'New York',
    duration: '5 days - 6 nights',
    rating: 5,
  },
  {
    image: 'dubai.jpg',
    price: '2,00,000₹',
    location: 'Dubai',
    duration: '10 days - 9 nights',
    rating: 5,
  },
];

const destinations = [
  { image: 'main.front page.jpg', country: 'maldives', city: 'male^' },
  { image: 'thailand.jpg', country: 'thailand', city: 'Bangkok' },
  { image: 'asutrelitya.avif', country: 'australia', city: 'sydney' },
  { image: 'img-4.jpg', country: 'spain', city: 'barcelona' },
  { image: 'japan.avif', country: 'japan', city: 'tokyo' },
  { image: 'img-6.jpg', country: 'malaysia', city: 'george town' },
];

const navigationLinks = [
  'About us',
  'Terms & Conditions',
  'Privacy Policy',
  'Help',
  'Tour',
];

const footerGroups = [
  {
    title: 'Quick Links',
    links: navigationLinks,
  },
  {
    title: 'Support',
    links: navigationLinks,
  },
  {
    title: 'Contact us',
    links: ['arshad faraz', 'shaikh aasif', '9662693442', '9274573766'],
  },
];

const createServiceCard = (service) => {
  const card = cloneTemplate('#service-card-template');
  const image = getRequiredElement('img', card);

  image.src = service.image;
  image.alt = service.title;
  getRequiredElement('h4', card).textContent = service.title;
  getRequiredElement('p', card).textContent = `${service.properties} Properties`;

  return card;
};

const createPackageCard = (tourPackage) => {
  const card = cloneTemplate('#package-card-template');
  const image = getRequiredElement('img', card);

  image.src = tourPackage.image;
  image.alt = tourPackage.location;
  getRequiredElement('.thum h3', card).textContent = tourPackage.price;
  getRequiredElement('.location h4', card).textContent = tourPackage.location;
  getRequiredElement('.location p', card).textContent = tourPackage.duration;

  renderCollection(
    getRequiredElement('.stars', card),
    Array.from({ length: tourPackage.rating }),
    () => {
      const star = document.createElement('i');
      const link = document.createElement('a');

      star.className = 'bx bxs-star';
      link.href = '#';
      link.setAttribute('aria-label', `${tourPackage.location} rating star`);
      link.append(star);

      return link;
    },
  );

  return card;
};

const createDestinationCard = (destination) => {
  const card = cloneTemplate('#destination-card-template');
  const image = getRequiredElement('img', card);

  image.src = destination.image;
  image.alt = `${destination.city}, ${destination.country}`;
  getRequiredElement('h5', card).textContent = destination.country;
  getRequiredElement('p', card).textContent = destination.city;

  return card;
};

const createFooterGroup = (group) => {
  const section = cloneTemplate('#footer-list-template');

  getRequiredElement('h4', section).textContent = group.title;
  renderCollection(getRequiredElement('ul', section), group.links, (text) => {
    const item = document.createElement('li');
    const link = document.createElement('a');

    link.href = '#';
    link.textContent = text;
    item.append(link);

    return item;
  });

  return section;
};

renderCollection(getRequiredElement('#service-list'), services, createServiceCard);
renderCollection(getRequiredElement('#package-list'), packages, createPackageCard);
renderCollection(
  getRequiredElement('#destination-list'),
  destinations,
  createDestinationCard,
);
renderCollection(getRequiredElement('#footer-lists'), footerGroups, createFooterGroup);
