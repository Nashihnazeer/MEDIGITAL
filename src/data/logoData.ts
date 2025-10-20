// src/data/logoData.ts
export type LogoItem = {
  id: string;
  src: string;   // path under /public/images/
  title: string;
  body: string;
};

const logoData: LogoItem[] = [
 {
  id: "c1",
  src: "/images/11.png",
  title: "Client One",
  body: "Chicking is an international fast-food restaurant chain founded in 2000 by A. K. Mansoor in Dubai, United Arab Emirates, and is known for its fried chicken and fully Halal menu. The company has expanded globally to over 23 countries with more than 230 outlets and offers a variety of fast food items, including chicken, burgers, wraps, and sides. Chicking emphasizes freshly prepared food, quality ingredients, and a diverse menu that incorporates global flavors. \n\nCompany and concept\nFounder: A. K. Mansoor\nFounded: 2000 in Dubai, United Arab Emirates\nHeadquarters: Dubai, United Arab Emirates\nBusiness Model: Quick Service Restaurant (QSR) specializing in fried chicken, with a focus on being a fully Halal-certified brand.\n\nMenu and offerings\nCore Products: Fried chicken is their specialty, but the menu also includes burgers, wraps, biryani, and grilled chicken.\nOther items: The menu also features side dishes, desserts, and milkshakes.\nFlavors: The brand uses a secret recipe with herbs and spices from around the world to create its unique flavors.\n\nGlobal presence\nReach: Chicking has a global presence, operating in over 23 countries across continents like Asia, Africa, Europe, and the Americas.\nExpansion: The brand has a significant international footprint, with many locations in the Middle East, Asia, and beyond.\n\nCompany focus\nHalal Compliance: Chicking is known for being one of the first fully Halal-certified fast-food chains.\nQuality: The company emphasizes using high-quality ingredients and freshly prepared food.\nMenu Innovation: Chicking is committed to evolving its menu and has introduced new items like grilled chicken and other options to cater to customer demand.\nStore Atmosphere: The restaurants aim to provide a welcoming and stylish environment for families and customers."
},




  
  { id: "c2", src: "/images/22.png", title: "Client Two", body: "Short description for Client Two." },
  { id: "c3", src: "/images/33.png", title: "Client Three", body: "Short description for Client Three." },
  { id: "c4", src: "/images/44.png", title: "Client Four", body: "Short description for Client Four." },
  { id: "c5", src: "/images/55.png", title: "Client Five", body: "Short description for Client Five." },
  { id: "c6", src: "/images/66.png", title: "Client Six", body: "Short description for Client Six nash." },
];

export default logoData;